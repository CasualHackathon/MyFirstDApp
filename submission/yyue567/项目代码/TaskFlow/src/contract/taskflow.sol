// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TaskFlow
 * @dev 基于智能合约的任务管理系统
 */
contract TaskFlow is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    // 事件定义
    event TaskCreated(uint256 indexed taskId, address indexed publisher, uint256 bounty, string ipfsHash);
    event TaskAccepted(uint256 indexed taskId, address indexed worker);
    event TaskCompleted(uint256 indexed taskId, address indexed worker);
    event TaskFailed(uint256 indexed taskId, address indexed worker, string reason);
    event RewardClaimed(uint256 indexed taskId, address indexed worker, uint256 amount);
    event DisputeRaised(uint256 indexed taskId, address indexed worker);
    event DisputeResolved(uint256 indexed taskId, bool workerWins);
    
    // 任务状态枚举
    enum TaskStatus {
        Open,       // 开放接取
        InProgress, // 进行中
        Completed,  // 已完成
        Failed,     // 失败
        Disputed    // 争议中
    }
    
    // 任务结构体
    struct Task {
        uint256 id;
        address publisher;
        address worker;
        uint256 bounty;
        uint256 deadline;
        TaskStatus status;
        string ipfsHash;        // IPFS哈希，存储任务详情
        string submissionHash;  // IPFS哈希，存储提交内容
        string failReason;      // 失败原因
        uint256 createdAt;
        uint256 acceptedAt;
        uint256 completedAt;
        bool rewardClaimed;
    }
    
    // 用户统计结构体
    struct UserStats {
        uint256 totalTasksPublished;
        uint256 totalTasksCompleted;
        uint256 totalTasksFailed;
        uint256 totalEarnings;
        uint256 reputation;
    }
    
    // 状态变量
    Counters.Counter private _taskIds;
    mapping(uint256 => Task) public tasks;
    mapping(address => UserStats) public userStats;
    mapping(address => uint256[]) public userPublishedTasks;
    mapping(address => uint256[]) public userAcceptedTasks;
    
    // 平台费用配置
    uint256 public platformFee = 500; // 5% (500/10000)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // 争议解决时间
    uint256 public disputePeriod = 7 days;
    
    // 构造函数
    constructor() {
        _taskIds.increment(); // 从1开始
    }
    
    /**
     * @dev 创建新任务
     * @param _bounty 赏金金额
     * @param _deadline 截止时间
     * @param _ipfsHash IPFS哈希，包含任务详情
     */
    function createTask(
        uint256 _bounty,
        uint256 _deadline,
        string memory _ipfsHash
    ) external payable {
        require(_bounty > 0, "Bounty must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(msg.value == _bounty, "Sent value must match bounty");
        
        uint256 taskId = _taskIds.current();
        _taskIds.increment();
        
        tasks[taskId] = Task({
            id: taskId,
            publisher: msg.sender,
            worker: address(0),
            bounty: _bounty,
            deadline: _deadline,
            status: TaskStatus.Open,
            ipfsHash: _ipfsHash,
            submissionHash: "",
            failReason: "",
            createdAt: block.timestamp,
            acceptedAt: 0,
            completedAt: 0,
            rewardClaimed: false
        });
        
        userPublishedTasks[msg.sender].push(taskId);
        userStats[msg.sender].totalTasksPublished++;
        
        emit TaskCreated(taskId, msg.sender, _bounty, _ipfsHash);
    }
    
    /**
     * @dev 接取任务
     * @param _taskId 任务ID
     */
    function acceptTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.status == TaskStatus.Open, "Task is not open");
        require(task.publisher != msg.sender, "Publisher cannot accept own task");
        require(block.timestamp < task.deadline, "Task deadline has passed");
        
        task.worker = msg.sender;
        task.status = TaskStatus.InProgress;
        task.acceptedAt = block.timestamp;
        
        userAcceptedTasks[msg.sender].push(_taskId);
        
        emit TaskAccepted(_taskId, msg.sender);
    }
    
    /**
     * @dev 完成任务
     * @param _taskId 任务ID
     * @param _submissionHash IPFS哈希，包含提交内容
     */
    function completeTask(uint256 _taskId, string memory _submissionHash) external {
        Task storage task = tasks[_taskId];
        require(task.worker == msg.sender, "Only worker can complete task");
        require(task.status == TaskStatus.InProgress, "Task is not in progress");
        require(block.timestamp <= task.deadline, "Task deadline has passed");
        
        task.status = TaskStatus.Completed;
        task.submissionHash = _submissionHash;
        task.completedAt = block.timestamp;
        
        userStats[msg.sender].totalTasksCompleted++;
        userStats[msg.sender].reputation += 10;
        
        emit TaskCompleted(_taskId, msg.sender);
    }
    
    /**
     * @dev 标记任务失败
     * @param _taskId 任务ID
     * @param _reason 失败原因
     */
    function failTask(uint256 _taskId, string memory _reason) external {
        Task storage task = tasks[_taskId];
        require(task.publisher == msg.sender, "Only publisher can fail task");
        require(task.status == TaskStatus.InProgress, "Task is not in progress");
        
        task.status = TaskStatus.Failed;
        task.failReason = _reason;
        
        userStats[task.worker].totalTasksFailed++;
        userStats[task.worker].reputation = userStats[task.worker].reputation > 5 ? 
            userStats[task.worker].reputation - 5 : 0;
        
        emit TaskFailed(_taskId, task.worker, _reason);
    }
    
    /**
     * @dev 领取赏金
     * @param _taskId 任务ID
     */
    function claimReward(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        require(task.worker == msg.sender, "Only worker can claim reward");
        require(task.status == TaskStatus.Completed, "Task is not completed");
        require(!task.rewardClaimed, "Reward already claimed");
        
        task.rewardClaimed = true;
        
        uint256 platformFeeAmount = (task.bounty * platformFee) / FEE_DENOMINATOR;
        uint256 workerAmount = task.bounty - platformFeeAmount;
        
        userStats[msg.sender].totalEarnings += workerAmount;
        
        payable(msg.sender).transfer(workerAmount);
        payable(owner()).transfer(platformFeeAmount);
        
        emit RewardClaimed(_taskId, msg.sender, workerAmount);
    }
    
    /**
     * @dev 发起争议
     * @param _taskId 任务ID
     */
    function raiseDispute(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.worker == msg.sender || task.publisher == msg.sender, "Not authorized");
        require(task.status == TaskStatus.InProgress, "Task is not in progress");
        
        task.status = TaskStatus.Disputed;
        
        emit DisputeRaised(_taskId, msg.sender);
    }
    
    /**
     * @dev 解决争议（仅管理员）
     * @param _taskId 任务ID
     * @param _workerWins 是否工人获胜
     */
    function resolveDispute(uint256 _taskId, bool _workerWins) external onlyOwner {
        Task storage task = tasks[_taskId];
        require(task.status == TaskStatus.Disputed, "Task is not disputed");
        
        if (_workerWins) {
            task.status = TaskStatus.Completed;
            userStats[task.worker].totalTasksCompleted++;
            userStats[task.worker].reputation += 5;
        } else {
            task.status = TaskStatus.Failed;
            userStats[task.worker].totalTasksFailed++;
            userStats[task.worker].reputation = userStats[task.worker].reputation > 3 ? 
                userStats[task.worker].reputation - 3 : 0;
        }
        
        emit DisputeResolved(_taskId, _workerWins);
    }
    
    /**
     * @dev 获取任务详情
     * @param _taskId 任务ID
     */
    function getTask(uint256 _taskId) external view returns (Task memory) {
        return tasks[_taskId];
    }
    
    /**
     * @dev 获取用户发布的任务
     * @param _user 用户地址
     */
    function getUserPublishedTasks(address _user) external view returns (uint256[] memory) {
        return userPublishedTasks[_user];
    }
    
    /**
     * @dev 获取用户接取的任务
     * @param _user 用户地址
     */
    function getUserAcceptedTasks(address _user) external view returns (uint256[] memory) {
        return userAcceptedTasks[_user];
    }
    
    /**
     * @dev 获取用户统计信息
     * @param _user 用户地址
     */
    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }
    
    /**
     * @dev 更新平台费用（仅管理员）
     * @param _newFee 新费用比例
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = _newFee;
    }
    
    /**
     * @dev 更新争议解决时间（仅管理员）
     * @param _newPeriod 新时间周期
     */
    function updateDisputePeriod(uint256 _newPeriod) external onlyOwner {
        disputePeriod = _newPeriod;
    }
    
    /**
     * @dev 紧急提取合约余额（仅管理员）
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev 获取合约余额
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
