// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BaseTask.sol";

/**
 * @title 按里程碑付款的任务合约
 * @notice 支持按里程碑付款的任务类型，任务可以分为多个阶段，每个阶段完成后支付相应报酬
 * @dev 实现里程碑式付款机制，任务创建者可以定义多个付款里程碑
 */
contract MilestonePaymentTask is BaseTask {
    using SafeERC20 for IERC20;

    // 里程碑结构
    struct Milestone {
        string description; // 里程碑描述
        uint256 reward; // 该里程碑的报酬
        bool paid; // 是否已支付
        uint256 completedAt; // 完成时间
        ProofOfWork workProof; // 该里程碑的工作量证明
    }

    // 存储任务的工作者地址
    mapping(uint256 => address) public taskWorker;

    // 存储任务的里程碑
    mapping(uint256 => Milestone[]) public taskMilestones;

    // 存储任务已完成的里程碑数量
    mapping(uint256 => uint256) public completedMilestonesCount;

    // 存储任务未支付里程碑的总奖励，用于避免循环计算
    mapping(uint256 => uint256) public unpaiDMilestonesTotalReward;

    // 自定义错误
    error MilestonePaymentTask_OnlyWorkerCanSubmitProof();
    error MilestonePaymentTask_TaskNotInProgress(uint256 taskId);
    error MilestonePaymentTask_TaskNotAddMileStone(uint256 taskId);
    error MilestonePaymentTask_ProofOfWorkEmpty();
    error MilestonePaymentTask_TaskCannotBeCancelled();
    error MilestonePaymentTask_InvalidWorkerAddress();
    error MilestonePaymentTask_TaskNotOpen(uint256 taskId);
    error MilestonePaymentTask_NoProofOfWorkSubmitted();
    error MilestonePaymentTask_ProofAlreadyApproved();
    error MilestonePaymentTask_InvalidMilestoneIndex();
    error MilestonePaymentTask_MilestoneAlreadyApproved();
    error MilestonePaymentTask_MilestoneNotApproved();
    error MilestonePaymentTask_MilestoneAlreadyPaid();
    error MilestonePaymentTask_NoMilestonesDefined();
    error MilestonePaymentTask_RewardInsufficient();
    error MilestonePaymentTask_OnlyOneWorkerAllowed();
    error MilestonePaymentTask_DeadlinePassed();
    error MilestonePaymentTask_MilestoneNotSubmitted();
    error MilestonePaymentTask_DisputeSubmissionPeriodNotReached();

    // 自定义事件
    event MilestonePaymentTask_TaskWorkerAdded(uint256 indexed taskId, address indexed worker);
    event MilestonePaymentTask_TaskCancelled(uint256 indexed taskId);
    event MilestonePaymentTask_MilestoneApproved(uint256 indexed taskId, uint256 milestoneIndex);
    event MilestonePaymentTask_MilestonePaid(
        uint256 indexed taskId, uint256 milestoneIndex, uint256 amount, uint256 platformFee
    );
    event MilestonePaymentTask_ProofOfWorkSubmitted(uint256 indexed taskId, address indexed worker, string proof);
    event MilestonePaymentTask_DisputeFiledByWorker(uint256 indexed taskId, address indexed worker);
    event MilestonePaymentTask_MilestoneAdded(
        uint256 indexed taskId, uint256 milestoneIndex, string description, uint256 reward
    );

    event MilestonePaymentTaskCreated(uint256 indexed taskId, address indexed creator, string title, uint256 deadline);

    event MilestonePaymentTask_TaskCompleted(uint256 indexed taskId);

    /**
     * @notice modifier，检查调用者是否为任务的工作者
     * @param _taskId 任务ID
     */
    modifier onlyTaskWorker(uint256 _taskId) {
        if (taskWorker[_taskId] != msg.sender) {
            revert MilestonePaymentTask_OnlyWorkerCanSubmitProof();
        }
        _;
    }

    /**
     * @notice modifier，检查任务是否处于进行中状态
     * @param _taskId 任务ID
     */
    modifier onlyTaskInProgress(uint256 _taskId) {
        if (tasks[_taskId].status != TaskStatus.InProgress) {
            revert MilestonePaymentTask_TaskNotInProgress(_taskId);
        }
        _;
    }

    modifier InvalidMilestoneIndex(uint256 _taskId, uint256 _milestoneIndex) {
        // 检查里程碑索引是否有效
        if (_milestoneIndex >= taskMilestones[_taskId].length) {
            revert MilestonePaymentTask_InvalidMilestoneIndex();
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
     * @notice 创建里程碑付款任务
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
        newTask.totalreward = 0;
        newTask.description = _description;
        newTask.deadline = _deadline;
        newTask.status = TaskStatus.Open;
        newTask.createdAt = block.timestamp;

        emit MilestonePaymentTaskCreated(taskCounter, msg.sender, _title, _deadline);
    }

    /**
     * @notice 添加工作者到任务中
     * @param _taskId 任务ID
     * @param _worker 工作者地址
     * @param _reward 任务总奖励（将在添加里程碑时分配）
     */
    function addWorker(uint256 _taskId, address _worker, uint256 _reward)
        public
        override
        onlyTaskCreator(_taskId)
        whenNotPaused
    {
        Task storage task = tasks[_taskId];

        if (task.status != TaskStatus.Open) {
            revert MilestonePaymentTask_TaskNotOpen(_taskId);
        }

        if (_worker == address(0)) {
            revert MilestonePaymentTask_InvalidWorkerAddress();
        }

        if (taskWorker[_taskId] != address(0)) {
            revert MilestonePaymentTask_OnlyOneWorkerAllowed();
        }

        taskWorker[_taskId] = _worker;
        task.totalreward += _reward;

        taskToken.safeTransferFrom(msg.sender, address(this), _reward);

        task.status = TaskStatus.InProgress;

        emit MilestonePaymentTask_TaskWorkerAdded(_taskId, _worker);
    }

    /**
     * @notice 为任务添加里程碑
     * @param _taskId 任务ID
     * @param _description 里程碑描述
     * @param _reward 里程碑报酬
     */
    function addMilestone(uint256 _taskId, string memory _description, uint256 _reward)
        external
        onlyTaskCreator(_taskId)
        whenNotPaused
    {
        Task storage task = tasks[_taskId];

        // 检查奖励是否有效
        if (_reward == 0) {
            revert RewardMoreThanZero();
        }

        if (task.status == TaskStatus.Paid || task.status == TaskStatus.Cancelled) {
            revert MilestonePaymentTask_TaskNotAddMileStone(_taskId);
        }

        // 检查总奖励是否超过任务总奖励
        uint256 currentTotalRewards = unpaiDMilestonesTotalReward[_taskId];

        if (currentTotalRewards + _reward > task.totalreward) {
            revert MilestonePaymentTask_RewardInsufficient();
        }

        // 添加里程碑
        taskMilestones[_taskId].push(
            Milestone({
                description: _description,
                reward: _reward,
                paid: false,
                completedAt: 0,
                workProof: ProofOfWork("", false, false, 0)
            })
        );

        // 更新未支付里程碑总奖励
        unpaiDMilestonesTotalReward[_taskId] += _reward;

        uint256 milestoneIndex = taskMilestones[_taskId].length - 1;
        emit MilestonePaymentTask_MilestoneAdded(_taskId, milestoneIndex, _description, _reward);
    }

    /**
     * @notice 为特定里程碑提交工作量证明
     * @param _taskId 任务ID
     * @param _milestoneIndex 里程碑索引
     * @param _proof 工作量证明内容
     */
    function submitMilestoneProofOfWork(uint256 _taskId, uint256 _milestoneIndex, string memory _proof)
        external
        whenNotPaused
        onlyTaskWorker(_taskId)
        onlyTaskInProgress(_taskId)
        InvalidMilestoneIndex(_taskId, _milestoneIndex)
    {
        Milestone[] storage milestones = taskMilestones[_taskId];

        if (bytes(_proof).length == 0) {
            revert MilestonePaymentTask_ProofOfWorkEmpty();
        }
        if (tasks[_taskId].deadline < block.timestamp) {
            revert MilestonePaymentTask_DeadlinePassed();
        }

        // 检查里程碑的工作量证明是否已经批准
        if (milestones[_milestoneIndex].workProof.approved) {
            revert MilestonePaymentTask_ProofAlreadyApproved();
        }

        // 更新里程碑的工作量证明
        milestones[_milestoneIndex].workProof =
            ProofOfWork({ proof: _proof, submitted: true, approved: false, submittedAt: block.timestamp });

        emit MilestonePaymentTask_ProofOfWorkSubmitted(_taskId, msg.sender, _proof);
    }

    /**
     * @notice 批准里程碑
     * @param _taskId 任务ID
     * @param _milestoneIndex 里程碑索引
     */
    function approveMilestone(uint256 _taskId, uint256 _milestoneIndex)
        external
        onlyTaskCreator(_taskId)
        whenNotPaused
        onlyTaskInProgress(_taskId)
        InvalidMilestoneIndex(_taskId, _milestoneIndex)
    {
        Milestone storage milestone = taskMilestones[_taskId][_milestoneIndex];

        // 检查里程碑是否已经批准
        if (milestone.workProof.approved) {
            revert MilestonePaymentTask_MilestoneAlreadyApproved();
        }

        // 如果里程碑有工作量证明，将其标记为已批准
        if (!milestone.workProof.submitted) {
            revert MilestonePaymentTask_MilestoneNotSubmitted();
        }
        milestone.workProof.approved = true;
        completedMilestonesCount[_taskId]++;
        emit MilestonePaymentTask_MilestoneApproved(_taskId, _milestoneIndex);
    }

    /**
     * @notice 标记任务为完成
     * @param _taskId 任务ID
     */
    function completeTask(uint256 _taskId) external whenNotPaused {
        Task storage task = tasks[_taskId];

        // 检查是否所有里程碑都已完成
        Milestone[] storage milestones = taskMilestones[_taskId];
        if (milestones.length == 0) {
            revert MilestonePaymentTask_NoMilestonesDefined();
        }

        // 使用已完成的里程碑计数器来检查是否所有里程碑都已批准
        if (completedMilestonesCount[_taskId] != milestones.length) {
            revert MilestonePaymentTask_MilestoneNotApproved();
        }

        task.status = TaskStatus.Paid;

        emit MilestonePaymentTask_TaskCompleted(_taskId);
    }

    /**
     * @notice 支付里程碑报酬
     * @param _taskId 任务ID
     * @param _milestoneIndex 里程碑索引
     */
    function payMilestone(uint256 _taskId, uint256 _milestoneIndex)
        public
        whenNotPaused
        InvalidMilestoneIndex(_taskId, _milestoneIndex)
    {
        Milestone storage milestone = taskMilestones[_taskId][_milestoneIndex];

        // 检查里程碑是否已批准
        if (!milestone.workProof.approved) {
            revert MilestonePaymentTask_MilestoneNotApproved();
        }

        // 检查里程碑是否已支付
        if (milestone.paid) {
            revert MilestonePaymentTask_MilestoneAlreadyPaid();
        }

        // 计算平台费用
        uint256 fee = (milestone.reward * platformFee) / DenominatorFee;
        uint256 payment = milestone.reward - fee;

        // 更新平台总收入
        totalPlatformRevenue += fee;
        // 标记里程碑为已支付
        milestone.paid = true;
        tasks[_taskId].totalreward -= milestone.reward;

        // 更新未支付里程碑总奖励
        unpaiDMilestonesTotalReward[_taskId] -= milestone.reward;

        // 支付给工作者
        address worker = taskWorker[_taskId];
        taskToken.safeTransfer(worker, payment);

        emit MilestonePaymentTask_MilestonePaid(_taskId, _milestoneIndex, payment, fee);
    }

    /**
     * @notice 终止任务，直接取消任务
     * @param _taskId 任务ID
     */
    function terminateTask(uint256 _taskId) public override onlyTaskCreator(_taskId) whenNotPaused {
        Task storage task = tasks[_taskId];

        if (task.status == TaskStatus.Cancelled || task.status == TaskStatus.Paid) {
            revert MilestonePaymentTask_TaskCannotBeCancelled();
        }

        // 立即更新状态，防止重入
        task.status = TaskStatus.Cancelled;

        // 检查是否有工作者以及工作量证明，如果有则可以提交纠纷
        address worker = taskWorker[_taskId];
        Milestone[] storage milestones = taskMilestones[_taskId];
        uint256 length = milestones.length;

        if (worker != address(0) && length > 0) {
            // 检查是否有任何里程碑提交了工作量证明
            for (uint256 i = 0; i < length; i++) {
                if (milestones[i].workProof.submitted && !milestones[i].workProof.approved) {
                    // 如果工作者已经提交了工作量证明，则提交纠纷进行评判
                    // 资金将在纠纷解决时分配，这里不需要进行补偿
                    submitDispute(_taskId, worker, task.creator, milestones[i].reward, milestones[i].workProof.proof);
                } else if (milestones[i].workProof.submitted && milestones[i].workProof.approved && !milestones[i].paid)
                {
                    // 对于已批准但未支付的里程碑，进行支付
                    payMilestone(_taskId, i);
                }
            }
        }

        // 如果还有剩余资金，将其返还给任务创建者
        if (task.totalreward > 0) {
            uint256 refundAmount = task.totalreward;
            task.totalreward = 0;
            taskToken.safeTransfer(task.creator, refundAmount);
        }

        emit MilestonePaymentTask_TaskCancelled(_taskId);
    }

    /**
     * @notice 允许工作者提交纠纷
     * @param _taskId 任务ID
     * @param _milestoneIndex 要提交纠纷的里程碑索引
     * @dev 只有任务的工作者可以调用此函数
     * @dev 只有在工作证明已提交但未被批准时才能调用
     * @dev 只有在工作证明提交一段时间后才能提交纠纷（防止过早提交）
     */
    function fileDisputeByWorker(uint256 _taskId, uint256 _milestoneIndex)
        external
        onlyTaskWorker(_taskId)
        onlyTaskInProgress(_taskId)
        whenNotPaused
        InvalidMilestoneIndex(_taskId, _milestoneIndex)
    {
        Task storage task = tasks[_taskId];
        ProofOfWork storage proof = taskMilestones[_taskId][_milestoneIndex].workProof;

        // 检查是否已提交工作证明
        if (!proof.submitted) {
            revert MilestonePaymentTask_NoProofOfWorkSubmitted();
        }

        // 检查工作证明是否已被批准
        if (proof.approved) {
            revert MilestonePaymentTask_ProofAlreadyApproved();
        }

        // 检查是否已经过了足够的时间（例如3天）工作者才能提交纠纷
        // 这给任务创建者一些时间来批准工作证明

        if (block.timestamp < proof.submittedAt + minTimeBeforeDispute) {
            revert MilestonePaymentTask_DisputeSubmissionPeriodNotReached();
        }

        // 提交纠纷
        submitDispute(_taskId, msg.sender, task.creator, task.totalreward, proof.proof);

        emit MilestonePaymentTask_DisputeFiledByWorker(_taskId, msg.sender);
    }

    /**
     * @notice 获取任务的里程碑数量
     * @param _taskId 任务ID
     * @return 里程碑数量
     */
    function getMilestonesCount(uint256 _taskId) external view returns (uint256) {
        return taskMilestones[_taskId].length;
    }

    /**
     * @notice 获取任务的里程碑详情
     * @param _taskId 任务ID
     * @param _milestoneIndex 里程碑索引
     * @return 里程碑结构
     */
    function getMilestone(uint256 _taskId, uint256 _milestoneIndex) external view returns (Milestone memory) {
        return taskMilestones[_taskId][_milestoneIndex];
    }

    /**
     * @notice 获取指定任务的所有里程碑信息
     * @param _taskId 任务ID
     * @return milestones 所有里程碑信息数组
     */
    function getAllMilestones(uint256 _taskId) external view returns (Milestone[] memory milestones) {
        milestones = taskMilestones[_taskId];
    }
}
