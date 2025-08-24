// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/task/BiddingTask.sol";
import "../contracts/TaskToken.sol";
import "../contracts/DisputeResolver.sol";
import "../contracts/UserInfo.sol";
import "../contracts/interface/IDisputeResolver.sol";

contract BiddingTaskTest is Test {
    BiddingTask public biddingTask;
    TaskToken public taskToken;
    DisputeResolver public disputeResolver;
    UserInfo public userInfo;

    address public owner;
    address public taskCreator;
    address public worker1;
    address public worker2;
    address public otherUser;

    uint256 public constant BID_AMOUNT_1 = 100 * 10 ** 18;
    uint256 public constant BID_AMOUNT_2 = 80 * 10 ** 18;
    uint256 public constant ADMIN_STAKE_AMOUNT = 1000 * 10 ** 18;

    function setUp() public {
        owner = address(this);
        taskCreator = address(0x1);
        worker1 = address(0x2);
        worker2 = address(0x3);
        otherUser = address(0x4);

        // 部署TaskToken合约
        taskToken = new TaskToken("Task Token", "TASK", 18);

        // 为用户铸造代币
        taskToken.mint(taskCreator, BID_AMOUNT_1 * 10);
        taskToken.mint(worker1, ADMIN_STAKE_AMOUNT);
        taskToken.mint(worker2, ADMIN_STAKE_AMOUNT);
        taskToken.mint(otherUser, BID_AMOUNT_1);

        // 部署DisputeResolver合约
        disputeResolver = new DisputeResolver(taskToken);

        // 部署UserInfo合约
        userInfo = new UserInfo();

        // 部署BiddingTask合约
        biddingTask = new BiddingTask(taskToken, IDisputeResolver(address(disputeResolver)));

        // 设置授权
        vm.prank(taskCreator);
        taskToken.approveTaskContract(address(biddingTask), BID_AMOUNT_1 * 10);

        vm.prank(worker1);
        taskToken.approveTaskContract(address(disputeResolver), ADMIN_STAKE_AMOUNT);

        vm.prank(worker2);
        taskToken.approveTaskContract(address(disputeResolver), ADMIN_STAKE_AMOUNT);
    }

    // 测试合约部署
    function testDeployment() public view {
        assertEq(biddingTask.owner(), owner);
        assertEq(address(biddingTask.taskToken()), address(taskToken));
        assertEq(address(biddingTask.disputeResolver()), address(disputeResolver));
    }

    // 测试创建任务
    function testCreateTask() public {
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        (
            uint256 id,
            address payable creator,
            string memory title,
            string memory description,
            uint256 totalreward,
            uint256 deadline,
            BaseTask.TaskStatus status,
            uint256 createdAt
        ) = biddingTask.tasks(1);

        assertEq(id, 1);
        assertEq(creator, taskCreator);
        assertEq(title, "Test Bidding Task");
        assertEq(description, "Test Description");
        assertEq(totalreward, 0);
        assertEq(deadline, block.timestamp + 1 days);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Open));
        assertGt(createdAt, 0);
        assertEq(biddingTask.taskCounter(), 1);
    }

    // 测试创建任务时截止时间无效
    function testCreateTaskInvalidDeadline() public {
        // 设置一个确定的区块时间戳
        vm.warp(1000000);

        vm.prank(taskCreator);
        vm.expectRevert(BaseTask.InvalidDeadline.selector);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp - 1 hours);
    }

    // 测试提交竞标
    function testSubmitBid() public {
        // 先创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者1提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 验证竞标已提交
        assertEq(biddingTask.getBidCount(1), 1);

        BiddingTask.Bid memory bid = biddingTask.getBid(1, 0);
        assertEq(bid.bidder, worker1);
        assertEq(bid.amount, BID_AMOUNT_1);
        assertEq(bid.description, "Bid description 1");
        assertEq(bid.estimatedTime, 2 days);
    }

    // 测试提交竞标时任务不是开放状态
    function testSubmitBidTaskNotOpen() public {
        // 先创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 另一个工作者尝试提交竞标应该失败
        vm.prank(worker2);
        vm.expectRevert(BiddingTask.BiddingTask_TaskNotOpen.selector);
        biddingTask.submitBid(1, BID_AMOUNT_2, "Bid description 2", 1 days);
    }

    // 测试提交竞标时金额为0
    function testSubmitBidInvalidAmount() public {
        // 先创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交金额为0的竞标应该失败
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_InvalidBidAmount.selector);
        biddingTask.submitBid(1, 0, "Bid description 1", 2 days);
    }

    // 测试提交竞标时描述为空
    function testSubmitBidEmptyDescription() public {
        // 先创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交描述为空的竞标应该失败
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_BidDescriptionEmpty.selector);
        biddingTask.submitBid(1, BID_AMOUNT_1, "", 2 days);
    }

    // 测试任务创建者接受竞标
    function testAcceptBid() public {
        // 先创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者1提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 工作者2提交竞标
        vm.prank(worker2);
        biddingTask.submitBid(1, BID_AMOUNT_2, "Bid description 2", 1 days);

        // 任务创建者接受工作者2的竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 1);

        // 验证任务状态
        (
            uint256 taskId,
            address payable taskCreatorAddr,
            string memory taskTitle,
            string memory taskDescription,
            uint256 reward,
            uint256 deadline,
            BaseTask.TaskStatus status,
            uint256 createdAt
        ) = biddingTask.tasks(1);

        assertEq(taskId, 1);
        assertEq(taskCreatorAddr, taskCreator);
        assertEq(taskTitle, "Test Bidding Task");
        assertEq(taskDescription, "Test Description");
        assertEq(reward, BID_AMOUNT_2);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.InProgress));
        assertEq(biddingTask.taskWorker(1), worker2);
        assertEq(taskToken.balanceOf(address(biddingTask)), BID_AMOUNT_2);
        assertEq(deadline, block.timestamp + 1 days);
        assertGt(createdAt, 0);
    }

    // 测试非任务创建者接受竞标
    function testAcceptBidOnlyTaskCreator() public {
        // 先创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 其他用户尝试接受竞标应该失败
        vm.prank(otherUser);
        vm.expectRevert(abi.encodeWithSelector(BaseTask.OnlyTaskCreator.selector, otherUser, 1));
        biddingTask.acceptBid(1, 0);
    }

    // 测试接受无效竞标索引
    function testAcceptBidInvalidIndex() public {
        // 先创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 任务创建者尝试接受不存在的竞标应该失败
        vm.prank(taskCreator);
        vm.expectRevert(BiddingTask.BiddingTask_InvalidBidIndex.selector);
        biddingTask.acceptBid(1, 0);
    }

    // 测试提交工作量证明
    function testSubmitProofOfWork() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 验证工作量证明已提交
        (string memory proof, bool submitted, bool approved, uint256 submittedAt) =
            biddingTask.taskWorkProofs(1, worker1);

        assertEq(proof, "This is my proof of work");
        assertTrue(submitted);
        assertFalse(approved);
        assertGt(submittedAt, 0);
    }

    // 测试非工作者提交工作量证明
    function testSubmitProofOfWorkOnlyWorker() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 其他用户尝试提交工作量证明应该失败
        vm.prank(otherUser);
        vm.expectRevert(BiddingTask.BiddingTask_OnlyWorkerCanSubmitProof.selector);
        biddingTask.submitProofOfWork(1, "This is my proof of work");
    }

    // 测试提交空工作量证明
    function testSubmitProofOfWorkEmpty() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者尝试提交空的工作量证明应该失败
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_ProofOfWorkEmpty.selector);
        biddingTask.submitProofOfWork(1, "");
    }

    // 测试验证工作量证明
    function testApproveProofOfWork() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者验证工作量证明
        vm.prank(taskCreator);
        biddingTask.approveProofOfWork(1, worker1);

        // 验证工作量证明已批准，任务状态已更新
        (string memory proof, bool submitted, bool approved, uint256 submittedAt) =
            biddingTask.taskWorkProofs(1, worker1);

        assertEq(proof, "This is my proof of work");
        assertTrue(submitted);
        assertTrue(approved);
        assertGt(submittedAt, 0);

        (,,,,,, BaseTask.TaskStatus status,) = biddingTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Completed));
    }

    // 测试支付任务
    function testPayTask() public {
        uint256 initialWorkerBalance = taskToken.balanceOf(worker1);
        uint256 initialPlatformRevenue = biddingTask.totalPlatformRevenue();

        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者验证工作量证明
        vm.prank(taskCreator);
        biddingTask.approveProofOfWork(1, worker1);

        // 工作者支付任务
        vm.prank(worker1);
        biddingTask.payTask(1);

        // 验证任务状态已更新
        (,,,,,, BaseTask.TaskStatus status,) = biddingTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Paid));

        // 验证资金已正确分配
        uint256 platformFee = (BID_AMOUNT_1 * 100) / 10000; // 1% 平台费用
        uint256 workerPayment = BID_AMOUNT_1 - platformFee;

        assertEq(taskToken.balanceOf(worker1), initialWorkerBalance + workerPayment);
        assertEq(biddingTask.totalPlatformRevenue(), initialPlatformRevenue + platformFee);
    }

    // 测试终止开放状态的任务
    function testTerminateTaskOpen() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 任务创建者终止任务
        vm.prank(taskCreator);
        biddingTask.terminateTask(1);

        // 验证任务状态已更新
        (,,,,,, BaseTask.TaskStatus status,) = biddingTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Cancelled));
    }

    // 测试终止进行中的任务
    function testTerminateTaskInProgress() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 任务创建者终止任务
        vm.prank(taskCreator);
        biddingTask.terminateTask(1);

        // 验证任务状态已更新
        (,,,,,, BaseTask.TaskStatus status,) = biddingTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Cancelled));
    }

    // 测试提交纠纷
    function testFileDisputeByWorker() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 推进时间以满足纠纷提交的最小时间要求 (3天)
        vm.warp(block.timestamp + 4 days);

        // 工作者提交纠纷
        vm.prank(worker1);
        biddingTask.fileDisputeByWorker(1);

        // 验证纠纷已提交
        // 这里主要是验证函数能正常执行，具体的纠纷处理逻辑在DisputeResolver中测试
    }

    // 测试提交纠纷时未提交工作量证明
    function testFileDisputeByWorkerNoProof() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者未提交工作量证明就尝试提交纠纷应该失败
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_NoProofOfWorkSubmitted.selector);
        biddingTask.fileDisputeByWorker(1);
    }

    // 测试提交纠纷时时间未到
    function testFileDisputeByWorkerTimeNotReached() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 未推进足够时间就尝试提交纠纷应该失败 (需要至少3天)
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_DisputeTimeNotReached.selector);
        biddingTask.fileDisputeByWorker(1);
    }

    // 测试提交工作量证明时任务状态不是进行中
    function testSubmitProofOfWorkTaskNotInProgress() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 任务创建者终止任务
        vm.prank(taskCreator);
        biddingTask.terminateTask(1);

        // 工作者尝试提交工作量证明应该失败
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_TaskNotInProgress.selector);
        biddingTask.submitProofOfWork(1, "This is my proof of work");
    }

    // 测试提交工作量证明时没有分配的工作者
    function testSubmitProofOfWorkNoAssignedWorker() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 在没有分配工作者的情况下尝试提交工作量证明应该失败
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_OnlyWorkerCanSubmitProof.selector);
        biddingTask.submitProofOfWork(1, "This is my proof of work");
    }

    // 测试批准工作量证明时未提交工作量证明
    function testApproveProofOfWorkNotSubmitted() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 尝试批准未提交的工作量证明应该失败
        vm.prank(taskCreator);
        vm.expectRevert(BiddingTask.BiddingTask_ProofNotSubmitted.selector);
        biddingTask.approveProofOfWork(1, worker1);
    }

    // 测试获取无效索引的竞标信息
    function testGetBidInvalidIndex() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 尝试获取无效索引的竞标信息应该失败
        vm.prank(taskCreator);
        vm.expectRevert(BiddingTask.BiddingTask_InvalidBidIndex.selector);
        biddingTask.getBid(1, 5); // 无效索引
    }

    // 测试在任务截止时间后提交竞标
    function testSubmitBidAfterDeadline() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 推进时间超过截止时间
        vm.warp(block.timestamp + 2 days);

        // 工作者尝试提交竞标应该失败
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_TaskDeadlinePassed.selector);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);
    }

    // 测试接受竞标时任务不是开放状态
    function testAcceptBidTaskNotOpen() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 再次尝试接受竞标应该失败，因为任务状态已改变
        vm.prank(taskCreator);
        vm.expectRevert(BiddingTask.BiddingTask_TaskNotOpen.selector);
        biddingTask.acceptBid(1, 0);
    }

    // 测试提交工作量证明时任务已截止
    function testSubmitProofOfWorkAfterDeadline() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 推进时间超过截止时间
        vm.warp(block.timestamp + 2 days);

        // 工作者尝试提交工作量证明应该失败
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_TaskDeadlinePassed.selector);
        biddingTask.submitProofOfWork(1, "This is my proof of work");
    }

    // 测试验证已批准的工作量证明
    function testApproveAlreadyApprovedProofOfWork() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者验证工作量证明
        vm.prank(taskCreator);
        biddingTask.approveProofOfWork(1, worker1);

        // 再次尝试验证已批准的工作量证明应该失败
        vm.prank(taskCreator);
        vm.expectRevert(BiddingTask.BiddingTask_TaskNotInProgress.selector);
        biddingTask.approveProofOfWork(1, worker1);
    }

    // 测试工作者在提交纠纷前时间不足
    function testFileDisputeByWorkerInsufficientTime() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 10 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 仅推进1天时间（不足3天）
        vm.warp(block.timestamp + 1 days);

        // 工作者尝试提交纠纷应该失败
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_DisputeTimeNotReached.selector);
        biddingTask.fileDisputeByWorker(1);
    }

    // 测试工作者提交纠纷时工作量证明已批准
    function testFileDisputeByWorkerApprovedProof() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 10 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者验证工作量证明
        vm.prank(taskCreator);
        biddingTask.approveProofOfWork(1, worker1);

        // 推进足够时间
        vm.warp(block.timestamp + 4 days);

        // 工作者尝试提交纠纷应该失败，因为工作量证明已批准
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_TaskNotInProgress.selector);
        biddingTask.fileDisputeByWorker(1);
    }

    // 测试终止已支付的任务
    /// @dev 测试当任务已经支付时尝试终止任务的情况
    function testTerminateTaskPaid() public {
        // 创建任务
        createBasicTaskAndApproveBid();

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者验证工作量证明
        vm.prank(taskCreator);
        biddingTask.approveProofOfWork(1, worker1);

        // 工作者支付任务
        vm.prank(worker1);
        biddingTask.payTask(1);

        // 尝试终止已支付的任务应该失败
        vm.prank(taskCreator);
        vm.expectRevert(BiddingTask.BiddingTask_TaskCannotBeCancelled.selector);
        biddingTask.terminateTask(1);
    }

    // 测试终止已取消的任务
    /// @dev 测试当任务已经取消时再次尝试终止任务的情况
    function testTerminateTaskCancelled() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 任务创建者终止任务
        vm.prank(taskCreator);
        biddingTask.terminateTask(1);

        // 尝试再次终止已取消的任务应该失败
        vm.prank(taskCreator);
        vm.expectRevert(BiddingTask.BiddingTask_TaskCannotBeCancelled.selector);
        biddingTask.terminateTask(1);
    }

    // 测试在任务创建者终止任务时没有分配工作者的情况
    function testTerminateTaskWithoutAssignedWorker() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 任务创建者终止任务（没有分配工作者）
        vm.prank(taskCreator);
        biddingTask.terminateTask(1);

        // 验证任务状态为已取消
        (,,,,,, BaseTask.TaskStatus status,) = biddingTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Cancelled));
    }

    // 测试在任务创建者终止任务时工作者已提交工作量证明的情况
    function testTerminateTaskWithSubmittedProofOfWork() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 10 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 推进时间
        vm.warp(block.timestamp + 4 days);

        // 任务创建者终止任务
        vm.prank(taskCreator);
        biddingTask.terminateTask(1);

        // 验证是否触发了纠纷提交
        // 这里我们验证任务状态为已取消，但实际应该触发纠纷
        // 在当前实现中，terminateTask函数会直接提交纠纷
        (,,,,,, BaseTask.TaskStatus status,) = biddingTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Cancelled));
    }

    // 测试提交已批准的工作量证明
    function testSubmitProofOfWorkAlreadyApproved() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者验证工作量证明
        vm.prank(taskCreator);
        biddingTask.approveProofOfWork(1, worker1);

        // 工作者尝试再次提交工作量证明应该失败，因为任务状态已不是InProgress
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_TaskNotInProgress.selector);
        biddingTask.submitProofOfWork(1, "This is another proof of work");
    }

    // 测试批准未提交的工作量证明（新版本）
    function testApproveProofOfWorkNotSubmittedNew() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 任务创建者尝试批准未提交的工作量证明应该失败
        vm.prank(taskCreator);
        vm.expectRevert(BiddingTask.BiddingTask_ProofNotSubmitted.selector);
        biddingTask.approveProofOfWork(1, worker1);
    }

    // 测试终止任务时工作者地址为0的情况
    function testTerminateTaskWithZeroWorkerAddress() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 任务创建者终止任务
        vm.prank(taskCreator);
        biddingTask.terminateTask(1);

        // 验证任务状态为已取消
        (,,,,,, BaseTask.TaskStatus status,) = biddingTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Cancelled));
    }

    // 测试工作者提交纠纷时工作量证明已批准的情况（新版本）
    function testFileDisputeByWorkerApprovedProofNew() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 10 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者提交工作量证明
        vm.prank(worker1);
        biddingTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者验证工作量证明
        vm.prank(taskCreator);
        biddingTask.approveProofOfWork(1, worker1);

        // 推进足够时间
        vm.warp(block.timestamp + 4 days);

        // 工作者尝试提交纠纷应该失败，因为任务状态已不是InProgress
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_TaskNotInProgress.selector);
        biddingTask.fileDisputeByWorker(1);
    }

    // 测试terminateTask中worker != address(0)条件为false的情况
    function testTerminateTaskWithZeroWorker() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 任务创建者终止任务，此时没有分配工作者
        vm.prank(taskCreator);
        biddingTask.terminateTask(1);

        // 验证任务状态为已取消
        (,,,,,, BaseTask.TaskStatus status,) = biddingTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Cancelled));
    }

    // 测试terminateTask中proof.submitted为false的情况
    function testTerminateTaskWithoutProofSubmitted() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 此时工作者尚未提交工作量证明，任务创建者终止任务
        vm.prank(taskCreator);
        biddingTask.terminateTask(1);

        // 验证任务状态为已取消
        (,,,,,, BaseTask.TaskStatus status,) = biddingTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Cancelled));
    }

    // 测试payTask任务未完成的情况
    function testPayTaskNotCompleted() public {
        // 创建任务
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);

        // 工作者尝试支付未完成的任务应该失败
        vm.prank(worker1);
        vm.expectRevert(BiddingTask.BiddingTask_TaskNotCompleted.selector);
        biddingTask.payTask(1);
    }

    // 创建基本任务并批准竞标
    /// @dev 创建一个基本任务并让工作者提交竞标，任务创建者接受竞标
    function createBasicTaskAndApproveBid() internal {
        vm.prank(taskCreator);
        biddingTask.createTask("Test Bidding Task", "Test Description", block.timestamp + 1 days);

        // 工作者提交竞标
        vm.prank(worker1);
        biddingTask.submitBid(1, BID_AMOUNT_1, "Bid description 1", 2 days);

        // 任务创建者接受竞标
        vm.prank(taskCreator);
        biddingTask.acceptBid(1, 0);
    }
}
