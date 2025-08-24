// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title 纠纷解决合约
 * @notice 用于处理任务创建者和工作者之间的纠纷，托管资金直到纠纷解决
 * @dev 该合约允许在纠纷期间冻结资金，直到质押者投票决定如何分配这些资金
 */
contract DisputeResolver is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // 纠纷状态枚举
    enum DisputeStatus {
        Filed, // 已提交纠纷
        Resolved, // 已解决（质押者投票已处理完成）
        Distributed // 已分配（资金已分配）

    }

    // 管理员状态枚举
    enum AdminStatus {
        Inactive, // 未激活
        Active // 激活

    }

    // 管理员投票结构体
    struct AdminVote {
        address admin; // 管理员地址
        uint256 workerShare; // 管理员投票的工作者份额
    }

    // 纠纷结构体
    struct Dispute {
        uint256 taskId; // 任务ID
        uint256 rewardAmount; // 奖励金额
        DisputeStatus status; // 纠纷状态
        uint256 filedAt; // 提交时间
        uint256 resolvedAt; // 解决时间
        AdminVote[] votes; // 投票列表
        address taskContract; // 任务合约地址
        address worker; // 工作者地址
        address taskCreator; // 任务创建者地址
        string proofOfWork; // 工作量证明内容
    }

    // 分配方案结构体
    struct DistributionProposal {
        uint256 workerShare; // 分配给工作者的金额
        bool workerApproved; // 工作者是否批准
        bool creatorApproved; // 创建者是否批准
    }

    // 平台代币地址
    IERC20 public immutable taskToken;

    // 纠纷计数器
    uint256 public disputeCounter;

    // 管理员质押金额
    uint256 public constant adminStakeAmount = 1000 * 10 ** 18; // 默认1000个代币

    // 纠纷处理奖励比例 (以基点表示，100基点=1%)
    uint256 public constant disputeProcessingRewardBps = 50; // 默认0.5%
    uint256 public constant DenominatorFee = 1e4;
    // 存储所有纠纷
    mapping(uint256 => Dispute) public disputes;

    // 存储纠纷的分配方案
    mapping(uint256 => DistributionProposal) public distributionProposals;

    // 存储管理员地址到质押金额的映射
    mapping(address => uint256) public adminStakes;

    // 存储管理员状态
    mapping(address => AdminStatus) public adminStatus;

    // 存储管理员是否已对特定纠纷投票
    mapping(address => mapping(uint256 => bool)) public hasVotedOnDispute;

    // 自定义错误
    error DisputeResolver_InvalidTaskContract();
    error DisputeResolver_NoActiveDispute();
    error DisputeResolver_DisputeNotResolved();
    error DisputeResolver_ZeroReward();
    error DisputeResolver_InvalidWorkerShare();
    error DisputeResolver_OnlyDisputeParty();
    error DisputeResolver_ProposalNotApproved();
    error DisputeResolver_AlreadyApproved();
    error DisputeResolver_AlreadyStaked();
    error DisputeResolver_NotAdmin();
    error DisputeResolver_AlreadyVoted();
    error DisputeResolver_NotEnoughVotes();
    error DisputeResolver_InvalidTaskToken();

    // 事件定义
    event DisputeResolver_DisputeFiled(
        uint256 indexed disputeId,
        uint256 indexed taskId,
        address indexed taskContract,
        address worker,
        address taskCreator
    );

    event DisputeResolver_DisputeResolved(uint256 indexed disputeId, uint256 workerShare);

    event DisputeResolver_ProposalApprovedByWorker(uint256 indexed disputeId, address worker);

    event DisputeResolver_ProposalApprovedByCreator(uint256 indexed disputeId, address taskCreator);

    event DisputeResolver_FundsDistributed(
        uint256 indexed disputeId, address worker, uint256 workerShare, address taskCreator
    );

    event DisputeResolver_ProposalRejected(uint256 indexed disputeId);

    event DisputeResolver_AdminStaked(address indexed admin, uint256 amount);

    event DisputeResolver_AdminWithdrawn(address indexed admin, uint256 amount);

    event DisputeResolver_AdminVoted(uint256 indexed disputeId, address indexed admin, uint256 workerShare);

    modifier onlyActiveDispute(uint256 _disputeId) {
        if (_disputeId >= disputeCounter) {
            revert DisputeResolver_NoActiveDispute();
        }
        _;
    }

    /**
     * @notice 构造函数
     * @param _taskToken 平台代币地址
     */
    constructor(IERC20 _taskToken) Ownable(msg.sender) {
        if (address(_taskToken) == address(0)) {
            revert DisputeResolver_InvalidTaskToken();
        }
        taskToken = _taskToken;
    }

    /**
     * @notice 管理员质押代币成为管理员
     */
    function stakeToBecomeAdmin() external {
        // 检查是否已经质押
        if (adminStakes[msg.sender] > 0) {
            revert DisputeResolver_AlreadyStaked();
        }

        // 质押代币
        taskToken.safeTransferFrom(msg.sender, address(this), adminStakeAmount);
        adminStakes[msg.sender] = adminStakeAmount;
        adminStatus[msg.sender] = AdminStatus.Active;

        emit DisputeResolver_AdminStaked(msg.sender, adminStakeAmount);
    }

    /**
     * @notice 管理员提取质押金（需要先取消管理员资格）
     */
    function withdrawStake() external nonReentrant {
        // 检查是否是管理员
        if (adminStakes[msg.sender] == 0) {
            revert DisputeResolver_NotAdmin();
        }

        adminStatus[msg.sender] = AdminStatus.Inactive;
        uint256 amount = adminStakes[msg.sender];
        adminStakes[msg.sender] = 0;

        taskToken.safeTransfer(msg.sender, amount);

        emit DisputeResolver_AdminWithdrawn(msg.sender, amount);
    }

    /**
     * @notice 提交纠纷
     * @param _taskContract 任务合约地址
     * @param _taskId 任务ID
     * @param _worker 工作者地址
     * @param _taskCreator 任务创建者地址
     * @param _rewardAmount 奖励金额
     * @param _proofOfWork 工作量证明内容
     */
    function fileDispute(
        address _taskContract,
        uint256 _taskId,
        address _worker,
        address _taskCreator,
        uint256 _rewardAmount,
        string memory _proofOfWork
    ) external nonReentrant {
        // 检查任务合约地址是否有效
        if (_taskContract == address(0)) {
            revert DisputeResolver_InvalidTaskContract();
        }

        // 检查奖励金额是否大于0
        if (_rewardAmount == 0) {
            revert DisputeResolver_ZeroReward();
        }

        // 创建新纠纷
        disputes[disputeCounter] = Dispute({
            taskId: _taskId,
            taskContract: _taskContract,
            worker: _worker,
            taskCreator: _taskCreator,
            proofOfWork: _proofOfWork,
            rewardAmount: _rewardAmount,
            status: DisputeStatus.Filed,
            filedAt: block.timestamp,
            resolvedAt: 0,
            votes: new AdminVote[](0)
        });
        // 增加纠纷计数器
        disputeCounter++;

        taskToken.safeTransferFrom(msg.sender, address(this), _rewardAmount);

        emit DisputeResolver_DisputeFiled(disputeCounter - 1, _taskId, _taskContract, _worker, _taskCreator);
    }

    /**
     * @notice 管理员对纠纷进行投票
     * @param _disputeId 纠纷ID
     * @param _workerShare 分配给工作者的金额
     */
    function voteOnDispute(uint256 _disputeId, uint256 _workerShare)
        external
        nonReentrant
        onlyActiveDispute(_disputeId)
    {
        // 检查是否是激活的管理员
        if (adminStatus[msg.sender] != AdminStatus.Active) {
            revert DisputeResolver_NotAdmin();
        }

        Dispute storage dispute = disputes[_disputeId];

        // 检查纠纷状态
        if (dispute.status != DisputeStatus.Filed) {
            revert DisputeResolver_DisputeNotResolved();
        }

        // 检查分配给工作者的金额是否有效
        if (_workerShare > dispute.rewardAmount) {
            revert DisputeResolver_InvalidWorkerShare();
        }

        // 检查是否已经投过票
        if (hasVotedOnDispute[msg.sender][_disputeId]) {
            revert DisputeResolver_AlreadyVoted();
        }

        // 记录投票
        dispute.votes.push(AdminVote({ admin: msg.sender, workerShare: _workerShare }));

        // 标记为已投票
        hasVotedOnDispute[msg.sender][_disputeId] = true;

        emit DisputeResolver_AdminVoted(_disputeId, msg.sender, _workerShare);
    }

    /**
     * @notice 处理管理员投票，计算平均值并解决纠纷
     * @param _disputeId 纠纷ID
     */
    function processVotes(uint256 _disputeId) external nonReentrant onlyActiveDispute(_disputeId) {
        Dispute storage dispute = disputes[_disputeId];

        // 检查纠纷状态
        if (dispute.status != DisputeStatus.Filed) {
            revert DisputeResolver_DisputeNotResolved();
        }

        uint256 length = dispute.votes.length;

        // 检查投票数量是否足够（至少需要3票）
        if (length < 3) {
            revert DisputeResolver_NotEnoughVotes();
        }

        // 计算平均值
        uint256 totalWorkerShare = 0;
        for (uint256 i = 0; i < length; i++) {
            totalWorkerShare += dispute.votes[i].workerShare;
        }
        uint256 averageWorkerShare = totalWorkerShare / length;

        // 更新纠纷状态
        dispute.status = DisputeStatus.Resolved;
        dispute.resolvedAt = block.timestamp;

        // 存储分配方案
        distributionProposals[_disputeId] =
            DistributionProposal({ workerShare: averageWorkerShare, workerApproved: false, creatorApproved: false });

        emit DisputeResolver_DisputeResolved(_disputeId, averageWorkerShare);
    }

    /**
     * @notice 纠纷相关方确认分配方案
     * @param _disputeId 纠纷ID
     */
    function approveProposal(uint256 _disputeId) external nonReentrant onlyActiveDispute(_disputeId) {
        Dispute storage dispute = disputes[_disputeId];
        DistributionProposal storage proposal = distributionProposals[_disputeId];

        // 检查调用者是否为纠纷相关方
        if (msg.sender != dispute.worker && msg.sender != dispute.taskCreator) {
            revert DisputeResolver_OnlyDisputeParty();
        }

        // 检查纠纷状态
        if (dispute.status != DisputeStatus.Resolved) {
            revert DisputeResolver_DisputeNotResolved();
        }

        // 检查是否已经确认过
        bool isWorker = msg.sender == dispute.worker;
        bool alreadyApproved = isWorker ? proposal.workerApproved : proposal.creatorApproved;
        if (alreadyApproved) {
            revert DisputeResolver_AlreadyApproved();
        }

        // 更新确认状态
        if (isWorker) {
            proposal.workerApproved = true;
            emit DisputeResolver_ProposalApprovedByWorker(_disputeId, msg.sender);
        } else {
            proposal.creatorApproved = true;
            emit DisputeResolver_ProposalApprovedByCreator(_disputeId, msg.sender);
        }
    }

    /**
     * @notice 分配纠纷资金（需要双方同意后才能执行）
     * @param _disputeId 纠纷ID
     */
    function distributeFunds(uint256 _disputeId) external nonReentrant onlyActiveDispute(_disputeId) {
        Dispute storage dispute = disputes[_disputeId];
        DistributionProposal storage proposal = distributionProposals[_disputeId];

        // 检查纠纷是否已解决
        if (dispute.status != DisputeStatus.Resolved) {
            revert DisputeResolver_DisputeNotResolved();
        }

        // 检查分配方案是否已获双方同意
        if (!proposal.workerApproved || !proposal.creatorApproved) {
            revert DisputeResolver_ProposalNotApproved();
        }

        // 计算奖励金额
        uint256 processingReward = (dispute.rewardAmount * disputeProcessingRewardBps) / DenominatorFee;

        // 计算实际分配给工作者和创建者的金额（扣除奖励）
        uint256 workerAmount = proposal.workerShare;
        uint256 creatorAmount = dispute.rewardAmount - workerAmount;

        // 从双方各扣除一半奖励金额
        uint256 RewardDeduction = processingReward / 2;

        if (workerAmount < RewardDeduction) {
            // 如果工作者获得的金额少于奖励的一半，从工作者处扣除全部金额，不足部分由创建者承担
            creatorAmount -= (processingReward - workerAmount);
            workerAmount = 0;
        } else if (creatorAmount < RewardDeduction) {
            // 如果创建者获得的金额少于奖励的一半，从创建者处扣除全部金额，不足部分由工作者承担
            workerAmount -= (processingReward - creatorAmount);
            creatorAmount = 0;
        } else {
            // 双方都有足够的资金，正常扣除
            workerAmount -= RewardDeduction;
            creatorAmount -= RewardDeduction;
        }

        // 计算每个评判人的奖励
        uint256 length = dispute.votes.length;
        uint256 rewardPerAdmin = processingReward / length;

        // 更新纠纷状态
        dispute.status = DisputeStatus.Distributed;

        // 转移资金给工作者
        if (workerAmount > 0) {
            taskToken.safeTransfer(dispute.worker, workerAmount);
        }

        // 转移资金给任务创建者
        if (creatorAmount > 0) {
            taskToken.safeTransfer(dispute.taskCreator, creatorAmount);
        }

        // 为参与投票的管理员增加质押资金（奖励）
        if (rewardPerAdmin > 0) {
            for (uint256 i = 0; i < length; i++) {
                address admin = dispute.votes[i].admin;
                adminStakes[admin] += rewardPerAdmin;
            }
        }

        emit DisputeResolver_FundsDistributed(_disputeId, dispute.worker, workerAmount, dispute.taskCreator);
    }

    /**
     * @notice 拒绝分配方案并重新进入解决状态
     * @param _disputeId 纠纷ID
     */
    function rejectProposal(uint256 _disputeId) external nonReentrant onlyActiveDispute(_disputeId) {
        Dispute storage dispute = disputes[_disputeId];
        DistributionProposal storage proposal = distributionProposals[_disputeId];

        // 检查调用者是否为纠纷相关方
        if (msg.sender != dispute.worker && msg.sender != dispute.taskCreator) {
            revert DisputeResolver_OnlyDisputeParty();
        }

        // 检查纠纷状态
        if (dispute.status != DisputeStatus.Resolved) {
            revert DisputeResolver_DisputeNotResolved();
        }

        // 计算拒绝费用（与处理奖励相同）
        uint256 processingReward = (dispute.rewardAmount * disputeProcessingRewardBps) / DenominatorFee;
        uint256 length = dispute.votes.length;

        // 收取拒绝费用并分配给评判人
        if (processingReward > 0) {
            taskToken.safeTransferFrom(msg.sender, address(this), processingReward);
            uint256 rewardPerAdmin = processingReward / length;

            // 为参与投票的管理员增加质押资金（拒绝费用）
            for (uint256 i = 0; i < length; i++) {
                address admin = dispute.votes[i].admin;
                adminStakes[admin] += rewardPerAdmin;
                hasVotedOnDispute[admin][_disputeId] = false;
            }
        }

        // 清空投票列表
        delete dispute.votes;

        // 将纠纷状态改回Filed状态，以便重新投票
        dispute.status = DisputeStatus.Filed;

        // 重置分配方案确认状态
        proposal.workerApproved = false;
        proposal.creatorApproved = false;

        emit DisputeResolver_ProposalRejected(_disputeId);
    }

    /**
     * @notice 获取纠纷详情
     * @param _disputeId 纠纷ID
     * @return 纠纷结构体
     */
    function getDispute(uint256 _disputeId) external view returns (Dispute memory) {
        return disputes[_disputeId];
    }

    /**
     * @notice 获取所有纠纷信息
     * @return disputesArray 包含所有纠纷信息的数组
     */
    function getAllDisputes() external view returns (Dispute[] memory) {
        Dispute[] memory disputesArray = new Dispute[](disputeCounter);
        for (uint256 i = 0; i < disputeCounter; i++) {
            disputesArray[i] = disputes[i];
        }
        return disputesArray;
    }

    /**
     * @notice 获取管理员质押金额
     * @param _admin 管理员地址
     * @return 质押金额
     */
    function getAdminStake(address _admin) external view returns (uint256) {
        return adminStakes[_admin];
    }
}
