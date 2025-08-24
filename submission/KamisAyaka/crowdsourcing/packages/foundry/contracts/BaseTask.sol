// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interface/IDisputeResolver.sol";

/**
 * @title 基础任务合约
 * @notice 定义众包任务的基本结构和功能，作为各种特定任务类型的基类
 * @dev 使用抽象合约模式，允许子合约实现特定任务类型的功能
 * @dev 提供任务核心逻辑的抽象接口
 */
abstract contract BaseTask is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // 任务状态枚举
    enum TaskStatus {
        Open, // 开放中，可被接受
        InProgress, // 进行中，已被接受
        Completed, // 已完成，等待支付
        Paid, // 已支付
        Cancelled // 已取消

    }

    // 任务结构体
    struct Task {
        uint256 id; // 任务ID
        address payable creator; // 任务创建者
        string title; // 任务标题
        string description; // 任务描述
        uint256 totalreward; // 任务奖励
        uint256 deadline; // 截止时间 (timestamp)
        TaskStatus status; // 任务状态
        uint256 createdAt; // 创建时间
    }

    // 工作量证明结构
    struct ProofOfWork {
        string proof; // 工作量证明内容
        bool submitted; // 是否已提交
        bool approved; // 是否已通过验证
        uint256 submittedAt; // 提交时间
    }

    // 自定义错误
    error OnlyTaskCreator(address caller, uint256 taskId);
    error FeeTooHigh(uint256 newFee);
    error NoRevenueToWithdraw();
    error RewardMoreThanZero();
    error InvalidDeadline();
    error BaseTask_InvalidTaskToken();
    error BaseTask_InvalidDisputeResolver();

    // 平台费用 (以基点计算，100 = 1%)
    uint256 public platformFee = 100; // 1%

    uint256 public constant DenominatorFee = 1e4;

    // 用户提交证明后最快申请纠纷的时间
    uint256 constant minTimeBeforeDispute = 3 days;

    // 任务计数器
    uint256 public taskCounter;

    // 平台总收入
    uint256 public totalPlatformRevenue;

    // 平台代币地址
    IERC20 public taskToken;

    // 纠纷解决合约地址 - 使用接口而不是具体合约
    IDisputeResolver public disputeResolver;

    // 存储所有任务
    mapping(uint256 => Task) public tasks;

    // 事件定义
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event DisputeResolverUpdated(address oldResolver, address newResolver);
    event TaskDeadlineChanged(uint256 taskId, uint256 newDeadline);
    event RewardIncreased(uint256 taskId, uint256 amount);
    event WithdrawPlatformRevenue(address owner, uint256 amount);

    /**
     * @notice modifier，检查调用者是否为任务创建者
     * @param _taskId 任务ID
     */
    modifier onlyTaskCreator(uint256 _taskId) {
        if (tasks[_taskId].creator != msg.sender) {
            revert OnlyTaskCreator(msg.sender, _taskId);
        }
        _;
    }

    /**
     * @notice 构造函数，设置合约所有者和平台代币
     * @param _taskToken 平台代币地址
     * @param _disputeResolver 纠纷解决合约地址
     */
    constructor(IERC20 _taskToken, IDisputeResolver _disputeResolver) Ownable(msg.sender) {
        if (address(_taskToken) == address(0)) {
            revert BaseTask_InvalidTaskToken();
        }
        if (address(_disputeResolver) == address(0)) {
            revert BaseTask_InvalidDisputeResolver();
        }
        taskToken = _taskToken;
        disputeResolver = _disputeResolver;
    }

    /**
     * @notice 抽象函数，由子合约实现具体的任务创建逻辑
     * @param _title 任务标题
     * @param _description 任务描述
     * @param _deadline 任务截止时间
     */
    function createTask(string memory _title, string memory _description, uint256 _deadline) public virtual;

    /**
     * @notice 抽象函数，由子合约实现具体的任务终止逻辑
     * @param _taskId 任务ID
     */
    function terminateTask(uint256 _taskId) public virtual;

    /**
     * @notice 抽象函数，由子合约实现具体的添加工作者逻辑
     * @param _taskId 任务ID
     * @param _worker 工作者地址
     */
    function addWorker(uint256 _taskId, address _worker, uint256 _reward) public virtual;

    /**
     * @notice 抽象函数，由子合约实现具体的纠纷提交逻辑
     * @param _taskId 任务ID
     * @param _worker 工作者地址
     * @param _taskCreator 任务创建者地址
     * @param _rewardAmount 奖励金额
     * @param _proofOfWork 工作量证明内容
     */
    function submitDispute(
        uint256 _taskId,
        address _worker,
        address _taskCreator,
        uint256 _rewardAmount,
        string memory _proofOfWork
    ) internal {
        tasks[_taskId].totalreward -= _rewardAmount;
        // 批准纠纷解决合约转移所需的资金
        taskToken.safeIncreaseAllowance(address(disputeResolver), _rewardAmount);

        // 调用纠纷解决合约的fileDispute函数
        // 资金将从当前合约转移到纠纷解决合约中
        disputeResolver.fileDispute(
            address(this), // 任务合约地址
            _taskId, // 任务ID
            _worker, // 工作者地址
            _taskCreator, // 任务创建者地址
            _rewardAmount, // 奖励金额
            _proofOfWork // 工作量证明内容
        );
    }

    /**
     * @notice 更新平台费用
     * @param _newFee 新费用 (基点)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        if (_newFee > 1000) {
            revert FeeTooHigh(_newFee);
        }

        emit PlatformFeeUpdated(platformFee, _newFee);
        platformFee = _newFee;
    }

    /**
     * @notice 暂停合约（紧急情况下）
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice 提取平台收入
     */
    function withdrawPlatformRevenue() external nonReentrant onlyOwner {
        if (totalPlatformRevenue == 0) {
            revert NoRevenueToWithdraw();
        }

        uint256 amount = totalPlatformRevenue;
        totalPlatformRevenue = 0;

        taskToken.safeTransfer(owner(), amount);

        emit WithdrawPlatformRevenue(owner(), amount);
    }

    function changedeadline(uint256 _taskId, uint256 _deadline) external onlyTaskCreator(_taskId) {
        Task storage task = tasks[_taskId];

        if (task.deadline >= _deadline) {
            revert InvalidDeadline();
        }

        task.deadline = _deadline;
        emit TaskDeadlineChanged(_taskId, task.deadline);
    }

    function increaseReward(uint256 _taskId, uint256 _reward) external onlyTaskCreator(_taskId) {
        Task storage task = tasks[_taskId];

        if (_reward == 0) {
            revert RewardMoreThanZero();
        }

        task.totalreward += _reward;

        taskToken.safeTransferFrom(msg.sender, address(this), _reward);

        emit RewardIncreased(_taskId, task.totalreward);
    }

    /**
     * @notice 获取任务详情
     * @param _taskId 任务ID
     * @return 任务结构体
     */
    function getTask(uint256 _taskId) public view returns (Task memory) {
        return tasks[_taskId];
    }
}
