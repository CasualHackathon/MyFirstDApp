// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BaseTask.sol";

/**
 * @title 竞价薪酬的任务合约
 * @notice 支持工作者竞价的任务类型，任务创建者可以选择最优报价
 * @dev 实现竞价机制，工作者可以提交报价，任务创建者选择中标者
 */
contract BiddingTask is BaseTask {
    using SafeERC20 for IERC20;

    // 竞标信息结构
    struct Bid {
        address bidder; // 竞标者地址
        uint256 amount; // 竞标金额
        string description; // 竞标描述/提案
        uint256 estimatedTime; // 预计完成时间（秒）
    }

    // 存储任务的竞标信息
    mapping(uint256 => Bid[]) public taskBids;

    // 存储任务的中标者
    mapping(uint256 => address) public taskWorker;

    // 存储任务的工作量证明
    mapping(uint256 => mapping(address => ProofOfWork)) public taskWorkProofs;

    // 自定义错误
    error BiddingTask_InvalidBidIndex();
    error BiddingTask_TaskNotOpen();
    error BiddingTask_InvalidBidAmount();
    error BiddingTask_BidDescriptionEmpty();
    error BiddingTask_OnlyWorkerCanSubmitProof();
    error BiddingTask_TaskNotInProgress();
    error BiddingTask_ProofOfWorkEmpty();
    error BiddingTask_ProofNotSubmitted();
    error BiddingTask_TaskCannotBeCancelled();
    error BiddingTask_TaskNotCompleted();
    error BiddingTask_InvalidWorkerAddress();
    error BiddingTask_TaskDeadlinePassed();
    error BiddingTask_ProofAlreadyApproved();
    error BiddingTask_DisputeTimeNotReached();
    error BiddingTask_NoProofOfWorkSubmitted();

    // 自定义事件
    event BiddingTask_BidSubmitted(uint256 indexed taskId, address indexed bidder, uint256 amount);

    event BiddingTask_TaskWorkerAdded(uint256 indexed taskId, address indexed worker);

    event BiddingTask_TaskCancelled(uint256 indexed taskId);

    event BiddingTask_TaskPaid(uint256 indexed taskId, uint256 amount, uint256 platformFee);

    event BiddingTask_ProofOfWorkSubmitted(uint256 indexed taskId, address indexed worker, string proof);

    event BiddingTask_ProofOfWorkApproved(uint256 indexed taskId, address indexed worker);

    event BiddingTask_DisputeFiledByWorker(uint256 indexed taskId, address indexed worker);

    event BiddingTaskCreated(uint256 indexed taskId, address indexed creator, string title, uint256 deadline);

    /**
     * @notice modifier，检查调用者是否为任务的工作者
     * @param _taskId 任务ID
     */
    modifier onlyTaskWorker(uint256 _taskId) {
        if (taskWorker[_taskId] != msg.sender) {
            revert BiddingTask_OnlyWorkerCanSubmitProof();
        }
        _;
    }

    /**
     * @notice modifier，检查任务是否处于进行中状态
     * @param _taskId 任务ID
     */
    modifier onlyTaskInProgress(uint256 _taskId) {
        if (tasks[_taskId].status != TaskStatus.InProgress) {
            revert BiddingTask_TaskNotInProgress();
        }
        _;
    }

    /**
     * @notice 构造函数
     * @param _taskToken 平台代币地址
     * @param _disputeResolver 纠纷解决合约地址
     */
    constructor(IERC20 _taskToken, IDisputeResolver _disputeResolver) BaseTask(_taskToken, _disputeResolver) { }

    /**
     * @notice 创建竞价任务
     * @param _title 任务标题
     * @param _description 任务描述
     * @param _deadline 任务截止时间
     */
    function createTask(string memory _title, string memory _description, uint256 _deadline)
        public
        override
        whenNotPaused
    {
        if (_deadline < block.timestamp) {
            revert InvalidDeadline();
        }

        taskCounter++;

        Task storage newTask = tasks[taskCounter];
        newTask.id = taskCounter;
        newTask.creator = payable(msg.sender);
        newTask.title = _title;
        newTask.totalreward = 0; // 竞价任务的报酬将在中标时确定
        newTask.description = _description;
        newTask.deadline = _deadline;
        newTask.status = TaskStatus.Open;
        newTask.createdAt = block.timestamp;

        emit BiddingTaskCreated(taskCounter, msg.sender, _title, _deadline);
    }

    /**
     * @notice 提交竞标
     * @param _taskId 任务ID
     * @param _amount 竞标金额
     * @param _description 竞标描述
     * @param _estimatedTime 预计完成时间（秒）
     */
    function submitBid(uint256 _taskId, uint256 _amount, string memory _description, uint256 _estimatedTime)
        external
        whenNotPaused
    {
        Task storage task = tasks[_taskId];

        // 检查任务是否开放竞标
        if (task.status != TaskStatus.Open) {
            revert BiddingTask_TaskNotOpen();
        }

        // 检查竞标金额是否有效
        if (_amount == 0) {
            revert BiddingTask_InvalidBidAmount();
        }

        // 检查竞标描述是否为空
        if (bytes(_description).length == 0) {
            revert BiddingTask_BidDescriptionEmpty();
        }

        if (block.timestamp > task.deadline) {
            revert BiddingTask_TaskDeadlinePassed();
        }

        // 创建新的竞标
        taskBids[_taskId].push(
            Bid({ bidder: msg.sender, amount: _amount, description: _description, estimatedTime: _estimatedTime })
        );

        emit BiddingTask_BidSubmitted(_taskId, msg.sender, _amount);
    }

    /**
     * @notice 任务创建者接受竞标
     * @param _taskId 任务ID
     * @param _bidIndex 竞标索引
     */
    function acceptBid(uint256 _taskId, uint256 _bidIndex) external onlyTaskCreator(_taskId) whenNotPaused {
        Task storage task = tasks[_taskId];

        // 检查任务是否开放
        if (task.status != TaskStatus.Open) {
            revert BiddingTask_TaskNotOpen();
        }

        // 检查竞标索引是否有效
        if (_bidIndex >= taskBids[_taskId].length) {
            revert BiddingTask_InvalidBidIndex();
        }

        Bid storage bid = taskBids[_taskId][_bidIndex];
        task.deadline = block.timestamp + bid.estimatedTime;

        // 调用addWorker添加工作者并设置报酬
        addWorker(_taskId, bid.bidder, bid.amount);
    }

    /**
     * @notice 添加工作者到任务中（在竞标任务中，由接受竞标触发）
     * @param _taskId 任务ID
     * @param _worker 工作者地址
     * @param _reward 任务报酬
     */
    function addWorker(uint256 _taskId, address _worker, uint256 _reward)
        public
        override
        onlyTaskCreator(_taskId)
        whenNotPaused
    {
        Task storage task = tasks[_taskId];

        // 设置任务工作者
        taskWorker[_taskId] = _worker;

        // 设置任务报酬
        task.totalreward = _reward;

        // 更新任务状态为进行中
        task.status = TaskStatus.InProgress;

        taskToken.safeTransferFrom(msg.sender, address(this), _reward);

        emit BiddingTask_TaskWorkerAdded(_taskId, _worker);
    }

    /**
     * @notice 终止任务
     * @param _taskId 任务ID
     */
    function terminateTask(uint256 _taskId) public override onlyTaskCreator(_taskId) whenNotPaused {
        Task storage task = tasks[_taskId];

        // 检查任务状态是否允许终止
        if (task.status == TaskStatus.Cancelled || task.status == TaskStatus.Paid) {
            revert BiddingTask_TaskCannotBeCancelled();
        }

        // 清理任务工作者并更新状态
        task.status = TaskStatus.Cancelled;

        // 获取当前分配的工作者
        address worker = taskWorker[_taskId];

        // 检查是否有工作量证明提交，如果有则可以提交纠纷
        ProofOfWork memory proof = taskWorkProofs[_taskId][worker];
        if (worker != address(0) && proof.submitted && !proof.approved) {
            // 如果工作者已经提交了工作量证明，则提交纠纷进行评判
            // 资金将在纠纷解决时分配，这里不需要进行补偿
            submitDispute(_taskId, worker, task.creator, task.totalreward, proof.proof);
        } else if (task.totalreward > 0) {
            uint256 amount = task.totalreward;
            task.totalreward = 0;
            taskToken.safeTransfer(task.creator, amount);
        }

        emit BiddingTask_TaskCancelled(_taskId);
    }

    /**
     * @notice 提交工作量证明
     * @param _taskId 任务ID
     * @param _proof 工作量证明内容
     */
    function submitProofOfWork(uint256 _taskId, string memory _proof)
        external
        whenNotPaused
        onlyTaskWorker(_taskId)
        onlyTaskInProgress(_taskId)
    {
        Task storage task = tasks[_taskId];
        if (block.timestamp >= task.deadline) {
            revert BiddingTask_TaskDeadlinePassed();
        }
        if (bytes(_proof).length == 0) {
            revert BiddingTask_ProofOfWorkEmpty();
        }

        // 检查工作量证明是否已经批准
        if (taskWorkProofs[_taskId][msg.sender].approved) {
            revert BiddingTask_ProofAlreadyApproved();
        }

        taskWorkProofs[_taskId][msg.sender] =
            ProofOfWork({ proof: _proof, submitted: true, approved: false, submittedAt: block.timestamp });

        emit BiddingTask_ProofOfWorkSubmitted(_taskId, msg.sender, _proof);
    }

    /**
     * @notice 验证工作量证明并检查工作者是否符合任务要求
     * @param _taskId 任务ID
     * @param _worker 工作者地址
     */
    function approveProofOfWork(uint256 _taskId, address _worker)
        external
        onlyTaskCreator(_taskId)
        whenNotPaused
        onlyTaskInProgress(_taskId)
    {
        Task storage task = tasks[_taskId];

        if (taskWorker[_taskId] != _worker) {
            revert BiddingTask_InvalidWorkerAddress();
        }

        ProofOfWork storage proof = taskWorkProofs[_taskId][_worker];
        if (!proof.submitted) {
            revert BiddingTask_ProofNotSubmitted();
        }

        proof.approved = true;
        task.status = TaskStatus.Completed;

        emit BiddingTask_ProofOfWorkApproved(_taskId, _worker);
    }

    /**
     * @notice 支付任务奖励
     * @param _taskId 任务ID
     */
    function payTask(uint256 _taskId) external onlyTaskWorker(_taskId) whenNotPaused {
        Task storage task = tasks[_taskId];

        // 检查任务是否可以支付
        if (task.status != TaskStatus.Completed) {
            revert BiddingTask_TaskNotCompleted();
        }

        // 计算平台费用
        uint256 fee = (task.totalreward * platformFee) / DenominatorFee;
        uint256 payment = task.totalreward - fee;

        // 更新平台总收入
        totalPlatformRevenue += fee;

        // 支付给工作者
        address worker = taskWorker[_taskId];
        taskToken.safeTransfer(worker, payment);

        // 更新任务状态
        task.status = TaskStatus.Paid;

        emit BiddingTask_TaskPaid(_taskId, payment, fee);
    }

    /**
     * @notice 允许工作者提交纠纷
     * @param _taskId 任务ID
     * @dev 只有任务的工作者可以调用此函数
     * @dev 只有在工作证明已提交但未被批准时才能调用
     * @dev 只有在工作证明提交一段时间后才能提交纠纷（防止过早提交）
     */
    function fileDisputeByWorker(uint256 _taskId)
        external
        onlyTaskWorker(_taskId)
        onlyTaskInProgress(_taskId)
        whenNotPaused
    {
        Task storage task = tasks[_taskId];
        ProofOfWork storage proof = taskWorkProofs[_taskId][msg.sender];

        // 检查是否已提交工作证明
        if (!proof.submitted) {
            revert BiddingTask_NoProofOfWorkSubmitted();
        }

        // 检查工作证明是否已被批准
        if (proof.approved) {
            revert BiddingTask_ProofAlreadyApproved();
        }

        // 检查是否已经过了足够的时间（例如3天）工作者才能提交纠纷
        // 这给任务创建者一些时间来批准工作证明

        if (block.timestamp < proof.submittedAt + minTimeBeforeDispute) {
            revert BiddingTask_DisputeTimeNotReached();
        }

        // 提交纠纷
        submitDispute(_taskId, msg.sender, task.creator, task.totalreward, proof.proof);

        emit BiddingTask_DisputeFiledByWorker(_taskId, msg.sender);
    }

    /**
     * @notice 获取任务的竞标数量
     * @param _taskId 任务ID
     * @return 竞标数量
     */
    function getBidCount(uint256 _taskId) external view returns (uint256) {
        return taskBids[_taskId].length;
    }

    /**
     * @notice 获取特定竞标信息
     * @param _taskId 任务ID
     * @param _bidIndex 竞标索引
     * @return 竞标信息
     */
    function getBid(uint256 _taskId, uint256 _bidIndex) external view returns (Bid memory) {
        if (_bidIndex >= taskBids[_taskId].length) {
            revert BiddingTask_InvalidBidIndex();
        }
        return taskBids[_taskId][_bidIndex];
    }

    /**
     * @notice 获取指定任务的所有竞标信息
     * @param _taskId 任务ID
     * @return bids 所有竞标信息数组
     */
    function getAllBids(uint256 _taskId) external view returns (Bid[] memory bids) {
        bids = taskBids[_taskId];
    }
}
