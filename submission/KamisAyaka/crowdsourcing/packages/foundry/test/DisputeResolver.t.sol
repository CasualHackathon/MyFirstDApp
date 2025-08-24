// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/DisputeResolver.sol";
import "../contracts/TaskToken.sol";

contract DisputeResolverTest is Test {
    DisputeResolver public disputeResolver;
    TaskToken public taskToken;
    address public owner;
    address public admin1;
    address public admin2;
    address public admin3;
    address public worker;
    address public taskCreator;

    uint256 public constant ADMIN_STAKE_AMOUNT = 1000 * 10 ** 18;
    uint256 public constant REWARD_AMOUNT = 100 * 10 ** 18;

    function setUp() public {
        owner = address(this);
        admin1 = address(0x1);
        admin2 = address(0x2);
        admin3 = address(0x3);
        worker = address(0x4);
        taskCreator = address(0x5);

        // 部署TaskToken合约
        taskToken = new TaskToken("Task Token", "TASK", 18);

        // 为管理员铸造代币
        taskToken.mint(admin1, ADMIN_STAKE_AMOUNT * 2);
        taskToken.mint(admin2, ADMIN_STAKE_AMOUNT * 2);
        taskToken.mint(admin3, ADMIN_STAKE_AMOUNT * 2);
        taskToken.mint(worker, ADMIN_STAKE_AMOUNT + REWARD_AMOUNT);
        taskToken.mint(taskCreator, ADMIN_STAKE_AMOUNT);

        // 部署DisputeResolver合约
        disputeResolver = new DisputeResolver(taskToken);

        // 设置授权
        vm.prank(admin1);
        taskToken.approveTaskContract(address(disputeResolver), ADMIN_STAKE_AMOUNT * 2);

        vm.prank(admin2);
        taskToken.approveTaskContract(address(disputeResolver), ADMIN_STAKE_AMOUNT * 2);

        vm.prank(admin3);
        taskToken.approveTaskContract(address(disputeResolver), ADMIN_STAKE_AMOUNT * 2);

        vm.prank(worker);
        taskToken.approveTaskContract(address(disputeResolver), ADMIN_STAKE_AMOUNT + REWARD_AMOUNT);

        vm.prank(taskCreator);
        taskToken.approveTaskContract(address(disputeResolver), ADMIN_STAKE_AMOUNT);
    }

    // 测试合约部署
    function testDeployment() public view {
        assertEq(disputeResolver.owner(), owner);
        assertEq(address(disputeResolver.taskToken()), address(taskToken));
        assertEq(disputeResolver.disputeCounter(), 0);
        assertEq(disputeResolver.adminStakeAmount(), ADMIN_STAKE_AMOUNT);
    }

    // 测试管理员质押成为管理员
    function testStakeToBecomeAdmin() public {
        uint256 initialBalance = taskToken.balanceOf(admin1);

        vm.prank(admin1);
        disputeResolver.stakeToBecomeAdmin();

        assertEq(disputeResolver.adminStakes(admin1), ADMIN_STAKE_AMOUNT);
        assertEq(uint8(disputeResolver.adminStatus(admin1)), uint8(DisputeResolver.AdminStatus.Active));
        assertEq(taskToken.balanceOf(admin1), initialBalance - ADMIN_STAKE_AMOUNT);
        assertEq(taskToken.balanceOf(address(disputeResolver)), ADMIN_STAKE_AMOUNT);
    }

    // 测试重复质押
    function testStakeToBecomeAdminAlreadyStaked() public {
        vm.prank(admin1);
        disputeResolver.stakeToBecomeAdmin();

        vm.prank(admin1);
        vm.expectRevert(DisputeResolver.DisputeResolver_AlreadyStaked.selector);
        disputeResolver.stakeToBecomeAdmin();
    }

    // 测试管理员提取质押
    function testWithdrawStake() public {
        // 先质押
        vm.prank(admin1);
        disputeResolver.stakeToBecomeAdmin();

        uint256 contractBalance = taskToken.balanceOf(address(disputeResolver));
        uint256 adminBalance = taskToken.balanceOf(admin1);

        // 提取质押
        vm.prank(admin1);
        disputeResolver.withdrawStake();

        assertEq(uint8(disputeResolver.adminStatus(admin1)), uint8(DisputeResolver.AdminStatus.Inactive));
        assertEq(disputeResolver.adminStakes(admin1), 0);
        assertEq(taskToken.balanceOf(admin1), adminBalance + ADMIN_STAKE_AMOUNT);
        assertEq(taskToken.balanceOf(address(disputeResolver)), contractBalance - ADMIN_STAKE_AMOUNT);
    }

    // 测试非管理员提取质押
    function testWithdrawStakeNotAdmin() public {
        vm.prank(admin1);
        vm.expectRevert(DisputeResolver.DisputeResolver_NotAdmin.selector);
        disputeResolver.withdrawStake();
    }

    // 测试提交纠纷
    function testFileDispute() public {
        // 先质押成为管理员
        vm.prank(admin1);
        disputeResolver.stakeToBecomeAdmin();

        uint256 initialWorkerBalance = taskToken.balanceOf(worker);
        uint256 initialContractBalance = taskToken.balanceOf(address(disputeResolver));

        // 提交纠纷
        vm.prank(worker);
        disputeResolver.fileDispute(address(0x123), 1, worker, taskCreator, REWARD_AMOUNT, "Proof of work");

        assertEq(disputeResolver.disputeCounter(), 1);

        DisputeResolver.Dispute memory dispute = disputeResolver.getDispute(0);
        assertEq(dispute.taskId, 1);
        assertEq(dispute.taskContract, address(0x123));
        assertEq(dispute.worker, worker);
        assertEq(dispute.taskCreator, taskCreator);
        assertEq(dispute.rewardAmount, REWARD_AMOUNT);
        assertEq(uint8(dispute.status), uint8(DisputeResolver.DisputeStatus.Filed));
        assertEq(dispute.proofOfWork, "Proof of work");
        assertEq(dispute.votes.length, 0);

        assertEq(taskToken.balanceOf(worker), initialWorkerBalance - REWARD_AMOUNT);
        assertEq(taskToken.balanceOf(address(disputeResolver)), initialContractBalance + REWARD_AMOUNT);
    }

    // 测试提交纠纷时任务合约地址为0
    function testFileDisputeInvalidTaskContract() public {
        vm.prank(worker);
        vm.expectRevert(DisputeResolver.DisputeResolver_InvalidTaskContract.selector);
        disputeResolver.fileDispute(address(0), 1, worker, taskCreator, REWARD_AMOUNT, "Proof of work");
    }

    // 测试提交纠纷时奖励金额为0
    function testFileDisputeZeroReward() public {
        vm.prank(worker);
        vm.expectRevert(DisputeResolver.DisputeResolver_ZeroReward.selector);
        disputeResolver.fileDispute(address(0x123), 1, worker, taskCreator, 0, "Proof of work");
    }

    // 测试管理员投票
    function testVoteOnDispute() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 管理员1投票
        vm.prank(admin1);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 2);

        // 验证投票结果
        assertTrue(disputeResolver.hasVotedOnDispute(admin1, 0));
        DisputeResolver.Dispute memory dispute = disputeResolver.getDispute(0);
        assertEq(dispute.votes.length, 1);
        assertEq(dispute.votes[0].admin, admin1);
        assertEq(dispute.votes[0].workerShare, REWARD_AMOUNT / 2);
    }

    // 测试非管理员投票
    function testVoteOnDisputeNotAdmin() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 非管理员尝试投票
        vm.prank(worker);
        vm.expectRevert(DisputeResolver.DisputeResolver_NotAdmin.selector);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 2);
    }

    // 测试管理员对无效纠纷投票
    function testVoteOnDisputeInvalidDisputeId() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 管理员尝试对不存在的纠纷投票
        vm.prank(admin1);
        vm.expectRevert(DisputeResolver.DisputeResolver_NoActiveDispute.selector);
        disputeResolver.voteOnDispute(1, REWARD_AMOUNT / 2);
    }

    // 测试管理员重复投票
    function testVoteOnDisputeAlreadyVoted() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 管理员1投票
        vm.prank(admin1);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 2);

        // 管理员1再次投票
        vm.prank(admin1);
        vm.expectRevert(DisputeResolver.DisputeResolver_AlreadyVoted.selector);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 3);
    }

    // 测试管理员投票金额超过奖励金额
    function testVoteOnDisputeInvalidWorkerShare() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 管理员1投票，金额超过奖励金额
        vm.prank(admin1);
        vm.expectRevert(DisputeResolver.DisputeResolver_InvalidWorkerShare.selector);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT + 1);
    }

    // 测试处理投票
    function testProcessVotes() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 三个管理员投票
        vm.prank(admin1);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 4);

        vm.prank(admin2);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 2);

        vm.prank(admin3);
        disputeResolver.voteOnDispute(0, (REWARD_AMOUNT * 3) / 4);

        // 处理投票
        disputeResolver.processVotes(0);

        // 验证处理结果
        DisputeResolver.Dispute memory dispute = disputeResolver.getDispute(0);
        assertEq(uint8(dispute.status), uint8(DisputeResolver.DisputeStatus.Resolved));
        assertGt(dispute.resolvedAt, 0);

        (uint256 workerShare, bool workerApproved, bool creatorApproved) = disputeResolver.distributionProposals(0);
        // 平均值应该是 (25 + 50 + 75) / 3 = 50
        assertEq(workerShare, REWARD_AMOUNT / 2);
        assertFalse(workerApproved);
        assertFalse(creatorApproved);
    }

    // 测试处理投票时纠纷状态不正确
    function testProcessVotesDisputeNotFiled() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 三个管理员投票
        vm.prank(admin1);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 4);

        vm.prank(admin2);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 2);

        vm.prank(admin3);
        disputeResolver.voteOnDispute(0, (REWARD_AMOUNT * 3) / 4);

        // 处理投票
        disputeResolver.processVotes(0);

        // 再次处理投票
        vm.expectRevert(DisputeResolver.DisputeResolver_DisputeNotResolved.selector);
        disputeResolver.processVotes(0);
    }

    // 测试处理投票时投票数量不足
    function testProcessVotesNotEnoughVotes() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 只有两个管理员投票（需要至少3个）
        vm.prank(admin1);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 4);

        vm.prank(admin2);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 2);

        // 处理投票
        vm.expectRevert(DisputeResolver.DisputeResolver_NotEnoughVotes.selector);
        disputeResolver.processVotes(0);
    }

    // 测试处理投票时纠纷已解决
    function testProcessVotesAlreadyProcessed() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 投票并处理
        voteAndProcess();

        // 尝试再次处理已解决的纠纷应该失败
        vm.expectRevert(DisputeResolver.DisputeResolver_DisputeNotResolved.selector);
        disputeResolver.processVotes(0);
    }

    // 测试批准提案
    function testApproveProposal() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 投票并处理
        voteAndProcess();

        // 工作者批准提案
        vm.prank(worker);
        disputeResolver.approveProposal(0);

        (uint256 workerShare, bool workerApproved, bool creatorApproved) = disputeResolver.distributionProposals(0);
        assertTrue(workerApproved);
        assertFalse(creatorApproved);

        // 任务创建者批准提案
        vm.prank(taskCreator);
        disputeResolver.approveProposal(0);

        (workerShare, workerApproved, creatorApproved) = disputeResolver.distributionProposals(0);
        assertTrue(workerApproved);
        assertTrue(creatorApproved);
    }

    // 测试非纠纷相关方批准提案
    function testApproveProposalOnlyDisputeParty() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 投票并处理
        voteAndProcess();

        // 非相关方尝试批准提案
        vm.prank(admin1);
        vm.expectRevert(DisputeResolver.DisputeResolver_OnlyDisputeParty.selector);
        disputeResolver.approveProposal(0);
    }

    // 测试重复批准提案
    function testApproveProposalAlreadyApproved() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 投票并处理
        voteAndProcess();

        // 工作者批准提案
        vm.prank(worker);
        disputeResolver.approveProposal(0);

        // 工作者再次批准提案
        vm.prank(worker);
        vm.expectRevert(DisputeResolver.DisputeResolver_AlreadyApproved.selector);
        disputeResolver.approveProposal(0);
    }

    // 测试批准提案时纠纷未解决
    function testApproveProposalDisputeNotResolved() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 尝试批准未解决的纠纷提案应该失败
        vm.prank(worker);
        vm.expectRevert(DisputeResolver.DisputeResolver_DisputeNotResolved.selector);
        disputeResolver.approveProposal(0);
    }

    // 测试分配资金
    function testDistributeFunds() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 投票并处理
        voteAndProcess();

        // 批准提案
        vm.prank(worker);
        disputeResolver.approveProposal(0);

        vm.prank(taskCreator);
        disputeResolver.approveProposal(0);

        uint256 initialContractBalance = taskToken.balanceOf(address(disputeResolver));
        uint256 initialWorkerBalance = taskToken.balanceOf(worker);
        uint256 initialCreatorBalance = taskToken.balanceOf(taskCreator);
        uint256 initialAdmin1Stake = disputeResolver.getAdminStake(admin1);
        uint256 initialAdmin2Stake = disputeResolver.getAdminStake(admin2);
        uint256 initialAdmin3Stake = disputeResolver.getAdminStake(admin3);

        // 分配资金
        disputeResolver.distributeFunds(0);

        // 验证分配结果
        DisputeResolver.Dispute memory dispute = disputeResolver.getDispute(0);
        assertEq(uint8(dispute.status), uint8(DisputeResolver.DisputeStatus.Distributed));

        uint256 processingReward = (REWARD_AMOUNT * 50) / 10000; // 0.5% = 0.5 * 10^18
        uint256 rewardPerAdmin = processingReward / 3;
        uint256 workerAmount = (REWARD_AMOUNT / 2);
        uint256 creatorAmount = (REWARD_AMOUNT / 2);

        // 从双方各扣除一半奖励金额
        uint256 rewardDeduction = processingReward / 2;
        workerAmount -= rewardDeduction;
        creatorAmount -= rewardDeduction;

        // 合约最终余额应该是初始余额减去分配给工作者和创建者的金额，但处理奖励仍留在合约中
        uint256 finalContractBalance = initialContractBalance - workerAmount - creatorAmount;
        assertEq(taskToken.balanceOf(address(disputeResolver)), finalContractBalance);
        assertEq(taskToken.balanceOf(worker), initialWorkerBalance + workerAmount);
        assertEq(taskToken.balanceOf(taskCreator), initialCreatorBalance + creatorAmount);
        assertEq(disputeResolver.getAdminStake(admin1), initialAdmin1Stake + rewardPerAdmin);
        assertEq(disputeResolver.getAdminStake(admin2), initialAdmin2Stake + rewardPerAdmin);
        assertEq(disputeResolver.getAdminStake(admin3), initialAdmin3Stake + rewardPerAdmin);
    }

    // 测试分配资金时提案未获批准
    function testDistributeFundsProposalNotApproved() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 投票并处理
        voteAndProcess();

        // 未批准提案就尝试分配资金
        vm.expectRevert(DisputeResolver.DisputeResolver_ProposalNotApproved.selector);
        disputeResolver.distributeFunds(0);
    }

    // 测试分配资金时纠纷未解决
    function testDistributeFundsDisputeNotResolved() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 尝试分配未解决的纠纷资金应该失败
        vm.expectRevert(DisputeResolver.DisputeResolver_DisputeNotResolved.selector);
        disputeResolver.distributeFunds(0);
    }

    // 测试拒绝提案
    function testRejectProposal() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 投票并处理
        voteAndProcess();

        uint256 initialBalance = taskToken.balanceOf(worker);
        uint256 initialAdmin1Stake = disputeResolver.getAdminStake(admin1);
        uint256 initialAdmin2Stake = disputeResolver.getAdminStake(admin2);
        uint256 initialAdmin3Stake = disputeResolver.getAdminStake(admin3);
        uint256 processingReward = (REWARD_AMOUNT * 50) / 10000; // 0.5%

        // 工作者拒绝提案
        vm.prank(worker);
        disputeResolver.rejectProposal(0);

        // 验证拒绝结果
        DisputeResolver.Dispute memory dispute = disputeResolver.getDispute(0);
        assertEq(uint8(dispute.status), uint8(DisputeResolver.DisputeStatus.Filed));
        assertEq(dispute.votes.length, 0);

        (, bool workerApproved, bool creatorApproved) = disputeResolver.distributionProposals(0);
        assertFalse(workerApproved);
        assertFalse(creatorApproved);

        // 检查拒绝费用是否正确扣除
        assertEq(taskToken.balanceOf(worker), initialBalance - processingReward);

        // 检查管理员质押金额是否增加了处理奖励
        uint256 rewardPerAdmin = processingReward / 3;
        assertEq(disputeResolver.getAdminStake(admin1), initialAdmin1Stake + rewardPerAdmin);
        assertEq(disputeResolver.getAdminStake(admin2), initialAdmin2Stake + rewardPerAdmin);
        assertEq(disputeResolver.getAdminStake(admin3), initialAdmin3Stake + rewardPerAdmin);

        // 验证管理员可以重新投票
        assertFalse(disputeResolver.hasVotedOnDispute(admin1, 0));
        assertFalse(disputeResolver.hasVotedOnDispute(admin2, 0));
        assertFalse(disputeResolver.hasVotedOnDispute(admin3, 0));
    }

    // 测试非相关方拒绝提案
    function testRejectProposalOnlyDisputeParty() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 投票并处理
        voteAndProcess();

        // 非相关方尝试拒绝提案
        vm.prank(admin1);
        vm.expectRevert(DisputeResolver.DisputeResolver_OnlyDisputeParty.selector);
        disputeResolver.rejectProposal(0);
    }

    // 测试拒绝提案时纠纷未解决
    function testRejectProposalDisputeNotResolved() public {
        // 准备测试环境
        setupDisputeAndAdmins();

        // 尝试拒绝未解决的纠纷提案应该失败
        vm.prank(worker);
        vm.expectRevert(DisputeResolver.DisputeResolver_DisputeNotResolved.selector);
        disputeResolver.rejectProposal(0);
    }

    // 辅助函数：设置纠纷和管理员
    function setupDisputeAndAdmins() internal {
        // 质押成为管理员
        vm.prank(admin1);
        disputeResolver.stakeToBecomeAdmin();

        vm.prank(admin2);
        disputeResolver.stakeToBecomeAdmin();

        vm.prank(admin3);
        disputeResolver.stakeToBecomeAdmin();

        // 提交纠纷
        vm.prank(worker);
        disputeResolver.fileDispute(address(0x123), 1, worker, taskCreator, REWARD_AMOUNT, "Proof of work");
    }

    // 辅助函数：投票并处理
    function voteAndProcess() internal {
        // 三个管理员投票 (25, 50, 75 tokens)
        vm.prank(admin1);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 4); // 25 * 10^18

        vm.prank(admin2);
        disputeResolver.voteOnDispute(0, REWARD_AMOUNT / 2); // 50 * 10^18

        vm.prank(admin3);
        disputeResolver.voteOnDispute(0, (REWARD_AMOUNT * 3) / 4); // 75 * 10^18

        // 处理投票，平均值为 (25 + 50 + 75) / 3 = 50 * 10^18
        disputeResolver.processVotes(0);
    }
}
