// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/task/FixedPaymentTask.sol";
import "../contracts/TaskToken.sol";
import "../contracts/DisputeResolver.sol";
import "../contracts/UserInfo.sol";
import "../contracts/interface/IDisputeResolver.sol";

contract FixedPaymentTaskTest is Test {
    FixedPaymentTask public fixedPaymentTask;
    TaskToken public taskToken;
    DisputeResolver public disputeResolver;
    UserInfo public userInfo;

    address public owner;
    address public taskCreator;
    address public worker;
    address public otherUser;

    uint256 public constant REWARD_AMOUNT = 100 * 10 ** 18;
    uint256 public constant ADMIN_STAKE_AMOUNT = 1000 * 10 ** 18;

    function setUp() public {
        owner = address(this);
        taskCreator = address(0x1);
        worker = address(0x2);
        otherUser = address(0x3);

        // 部署TaskToken合约
        taskToken = new TaskToken("Task Token", "TASK", 18);

        // 为用户铸造代币
        taskToken.mint(taskCreator, REWARD_AMOUNT * 10);
        taskToken.mint(worker, ADMIN_STAKE_AMOUNT);
        taskToken.mint(otherUser, REWARD_AMOUNT);

        // 部署DisputeResolver合约
        disputeResolver = new DisputeResolver(taskToken);

        // 部署UserInfo合约
        userInfo = new UserInfo();

        // 部署FixedPaymentTask合约
        fixedPaymentTask = new FixedPaymentTask(taskToken, IDisputeResolver(address(disputeResolver)));

        // 设置授权
        vm.prank(taskCreator);
        taskToken.approveTaskContract(address(fixedPaymentTask), REWARD_AMOUNT * 10);

        vm.prank(worker);
        taskToken.approveTaskContract(address(disputeResolver), ADMIN_STAKE_AMOUNT);
    }

    // 测试合约部署
    function testDeployment() public view {
        assertEq(fixedPaymentTask.owner(), owner);
        assertEq(address(fixedPaymentTask.taskToken()), address(taskToken));
        assertEq(address(fixedPaymentTask.disputeResolver()), address(disputeResolver));
    }

    // 测试创建任务
    function testCreateTask() public {
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        (
            uint256 id,
            address creator,
            string memory title,
            string memory description,
            uint256 reward,
            uint256 deadline,
            BaseTask.TaskStatus status,
            uint256 createdAt
        ) = fixedPaymentTask.tasks(1);

        assertEq(id, 1);
        assertEq(creator, taskCreator);
        assertEq(title, "Test Task");
        assertEq(description, "Test Description");
        assertEq(reward, 0);
        assertEq(deadline, block.timestamp + 1 days);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Open));
        assertGt(createdAt, 0);
        assertEq(fixedPaymentTask.taskCounter(), 1);
    }

    // 测试创建任务时截止时间无效
    function testCreateTaskInvalidDeadline() public {
        // 设置一个确定的区块时间戳
        vm.warp(1000000);

        vm.prank(taskCreator);
        vm.expectRevert(BaseTask.InvalidDeadline.selector);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp - 1 hours);
    }

    // 测试添加工作者
    function testAddWorker() public {
        // 先创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者并存入报酬
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 检查任务状态
        (,,,, uint256 reward,, BaseTask.TaskStatus status,) = fixedPaymentTask.tasks(1);
        assertEq(reward, REWARD_AMOUNT);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.InProgress));
        assertEq(fixedPaymentTask.taskWorker(1), worker);
        assertEq(taskToken.balanceOf(address(fixedPaymentTask)), REWARD_AMOUNT);
    }

    // 测试只有任务创建者可以添加工作者
    function testAddWorkerOnlyTaskCreator() public {
        // 先创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 其他用户尝试添加工作者
        vm.prank(otherUser);
        vm.expectRevert(abi.encodeWithSelector(BaseTask.OnlyTaskCreator.selector, otherUser, 1));
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);
    }

    // 测试提交工作量证明
    function testSubmitProofOfWork() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 工作者提交工作量证明
        vm.prank(worker);
        fixedPaymentTask.submitProofOfWork(1, "This is my proof of work");

        // 验证工作量证明已提交
        (string memory proof, bool submitted, bool approved, uint256 submittedAt) =
            fixedPaymentTask.taskWorkProofs(1, worker);

        assertEq(proof, "This is my proof of work");
        assertTrue(submitted);
        assertFalse(approved);
        assertGt(submittedAt, 0);
    }

    // 测试验证工作量证明
    function testApproveProofOfWork() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 工作者提交工作量证明
        vm.prank(worker);
        fixedPaymentTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者验证工作量证明
        vm.prank(taskCreator);
        fixedPaymentTask.approveProofOfWork(1, worker);

        // 验证工作量证明已批准，任务状态已更新
        (string memory proof, bool submitted, bool approved, uint256 submittedAt) =
            fixedPaymentTask.taskWorkProofs(1, worker);

        assertEq(proof, "This is my proof of work");
        assertTrue(submitted);
        assertTrue(approved);
        assertGt(submittedAt, 0);

        (,,,,,, BaseTask.TaskStatus status,) = fixedPaymentTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Completed));
    }

    // 测试支付任务
    function testPayTask() public {
        uint256 initialWorkerBalance = taskToken.balanceOf(worker);
        uint256 initialPlatformRevenue = fixedPaymentTask.totalPlatformRevenue();

        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 工作者提交工作量证明
        vm.prank(worker);
        fixedPaymentTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者验证工作量证明
        vm.prank(taskCreator);
        fixedPaymentTask.approveProofOfWork(1, worker);

        // 工作者支付任务
        vm.prank(worker);
        fixedPaymentTask.payTask(1);

        // 验证任务状态已更新
        (,,,,,, BaseTask.TaskStatus status,) = fixedPaymentTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Paid));

        // 验证资金已正确分配
        uint256 platformFee = (REWARD_AMOUNT * 100) / 10000; // 1% 平台费用
        uint256 workerPayment = REWARD_AMOUNT - platformFee;

        assertEq(taskToken.balanceOf(worker), initialWorkerBalance + workerPayment);
        assertEq(fixedPaymentTask.totalPlatformRevenue(), initialPlatformRevenue + platformFee);
    }

    // 测试终止任务
    function testTerminateTask() public {
        uint256 initialCreatorBalance = taskToken.balanceOf(taskCreator);

        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 任务创建者终止任务
        vm.prank(taskCreator);
        fixedPaymentTask.terminateTask(1);

        // 验证任务状态已更新
        (,,,,,, BaseTask.TaskStatus status,) = fixedPaymentTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Cancelled));

        // 验证资金已退还给任务创建者

        assertEq(taskToken.balanceOf(taskCreator), initialCreatorBalance);

        assertEq(taskToken.balanceOf(address(fixedPaymentTask)), 0);
    }

    // 测试提交工作量证明时截止时间已过的情况
    function testSubmitProofOfWorkDeadlinePassed() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 hours);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 将时间推进到截止时间之后
        vm.warp(block.timestamp + 2 hours);

        // 工作者尝试提交工作量证明应该失败
        vm.prank(worker);
        vm.expectRevert(FixedPaymentTask.FixedPaymentTask_TaskDeadlinePassed.selector);
        fixedPaymentTask.submitProofOfWork(1, "This is my proof of work");
    }

    // 测试提交空工作量证明的情况
    function testSubmitProofOfWorkEmpty() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 工作者尝试提交空的工作量证明应该失败
        vm.prank(worker);
        vm.expectRevert(FixedPaymentTask.FixedPaymentTask_ProofOfWorkEmpty.selector);
        fixedPaymentTask.submitProofOfWork(1, "");
    }

    // 测试非工作者提交工作量证明的情况
    function testSubmitProofOfWorkOnlyWorker() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 其他用户尝试提交工作量证明应该失败
        vm.prank(otherUser);
        vm.expectRevert(FixedPaymentTask.FixedPaymentTask_OnlyWorkerCanSubmitProof.selector);
        fixedPaymentTask.submitProofOfWork(1, "This is my proof of work");
    }

    // 测试验证工作量证明时未提交证明的情况
    function testApproveProofOfWorkNotSubmitted() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 任务创建者尝试验证未提交的工作量证明应该失败
        vm.prank(taskCreator);
        vm.expectRevert(FixedPaymentTask.FixedPaymentTask_ProofNotSubmitted.selector);
        fixedPaymentTask.approveProofOfWork(1, worker);
    }

    // 测试支付任务时任务状态不正确的情况
    function testPayTaskNotCompleted() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 工作者尝试支付未完成的任务应该失败
        vm.prank(worker);
        vm.expectRevert(FixedPaymentTask.FixedPaymentTask_TaskNotCompleted.selector);
        fixedPaymentTask.payTask(1);
    }

    // 测试添加工作者时使用无效地址的情况
    function testAddWorkerInvalidAddress() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 尝试添加零地址工作者应该失败
        vm.prank(taskCreator);
        vm.expectRevert(FixedPaymentTask.FixedPaymentTask_InvalidWorkerAddress.selector);
        fixedPaymentTask.addWorker(1, address(0), REWARD_AMOUNT);
    }

    // 测试向非开放状态的任务添加工作者的情况
    function testAddWorkerNotOpen() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 完成任务
        vm.prank(worker);
        fixedPaymentTask.submitProofOfWork(1, "This is my proof of work");

        vm.prank(taskCreator);
        fixedPaymentTask.approveProofOfWork(1, worker);

        address anotherWorker = address(0x4);
        // 尝试向已完成的任务添加另一个工作者应该失败
        vm.prank(taskCreator);
        vm.expectRevert(abi.encodeWithSelector(FixedPaymentTask.FixedPaymentTask_TaskNotOpen.selector, 1));
        fixedPaymentTask.addWorker(1, anotherWorker, REWARD_AMOUNT);
    }

    // 测试fileDisputeByWorker函数 - 提交纠纷的情况
    function testFileDisputeByWorker() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 工作者提交工作量证明
        vm.prank(worker);
        fixedPaymentTask.submitProofOfWork(1, "This is my proof of work");

        // 推进时间以满足纠纷提交的最小时间要求 (3天)
        vm.warp(block.timestamp + 4 days);

        // 工作者提交纠纷
        vm.prank(worker);
        fixedPaymentTask.fileDisputeByWorker(1);

        // 验证纠纷已提交
        // 这里主要是验证函数能正常执行，具体的纠纷处理逻辑在DisputeResolver中测试
    }

    // 测试fileDisputeByWorker函数 - 未提交工作量证明的情况
    function testFileDisputeByWorkerNoProof() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 工作者未提交工作量证明就尝试提交纠纷应该失败
        vm.prank(worker);
        vm.expectRevert(FixedPaymentTask.FixedPaymentTask_NoProofOfWorkSubmitted.selector);
        fixedPaymentTask.fileDisputeByWorker(1);
    }

    // 测试fileDisputeByWorker函数 - 工作量证明已批准的情况
    function testFileDisputeByWorkerAlreadyApproved() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 工作者提交工作量证明
        vm.prank(worker);
        fixedPaymentTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者批准工作量证明
        vm.prank(taskCreator);
        fixedPaymentTask.approveProofOfWork(1, worker);

        // 推进时间
        vm.warp(block.timestamp + 4 days);

        // 工作者尝试对已批准的工作量证明提交纠纷应该失败
        // 由于任务状态已经不是InProgress，所以会触发TaskNotInProgress错误
        vm.prank(worker);
        vm.expectRevert(FixedPaymentTask.FixedPaymentTask_TaskNotInProgress.selector);
        fixedPaymentTask.fileDisputeByWorker(1);
    }

    // 测试fileDisputeByWorker函数 - 时间未到的情况
    function testFileDisputeByWorkerTimeNotReached() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 工作者提交工作量证明
        vm.prank(worker);
        fixedPaymentTask.submitProofOfWork(1, "This is my proof of work");

        // 未推进足够时间就尝试提交纠纷应该失败 (需要至少3天)
        vm.prank(worker);
        vm.expectRevert(FixedPaymentTask.FixedPaymentTask_DisputeTimeNotReached.selector);
        fixedPaymentTask.fileDisputeByWorker(1);
    }

    // 测试提交已批准的工作量证明
    function testSubmitProofOfWorkAlreadyApproved() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 工作者提交工作量证明
        vm.prank(worker);
        fixedPaymentTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者验证工作量证明
        vm.prank(taskCreator);
        fixedPaymentTask.approveProofOfWork(1, worker);

        // 工作者尝试再次提交工作量证明应该失败，因为任务状态已不是InProgress
        vm.prank(worker);
        vm.expectRevert(FixedPaymentTask.FixedPaymentTask_TaskNotInProgress.selector);
        fixedPaymentTask.submitProofOfWork(1, "This is another proof of work");
    }

    // 测试terminateTask中worker != address(0)条件为false的情况
    function testTerminateTaskWithZeroWorker() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 任务创建者终止任务，此时没有分配工作者
        vm.prank(taskCreator);
        fixedPaymentTask.terminateTask(1);

        // 验证任务状态为已取消
        (,,,,,, BaseTask.TaskStatus status,) = fixedPaymentTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Cancelled));
    }

    // 测试terminateTask中proof.submitted为false的情况
    function testTerminateTaskWithoutProofSubmitted() public {
        uint256 initialCreatorBalance = taskToken.balanceOf(taskCreator);

        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 此时工作者尚未提交工作量证明，任务创建者终止任务
        vm.prank(taskCreator);
        fixedPaymentTask.terminateTask(1);

        // 验证任务状态为已取消
        (,,,,,, BaseTask.TaskStatus status,) = fixedPaymentTask.tasks(1);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Cancelled));

        // 验证资金已退还给任务创建者
        assertEq(taskToken.balanceOf(taskCreator), initialCreatorBalance);
        assertEq(taskToken.balanceOf(address(fixedPaymentTask)), 0);
    }

    // 测试approveProofOfWork工作者地址不匹配的情况
    function testApproveProofOfWorkNoWorkerAssigned() public {
        // 创建任务
        vm.prank(taskCreator);
        fixedPaymentTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 添加工作者
        vm.prank(taskCreator);
        fixedPaymentTask.addWorker(1, worker, REWARD_AMOUNT);

        // 工作者提交工作量证明
        vm.prank(worker);
        fixedPaymentTask.submitProofOfWork(1, "This is my proof of work");

        // 任务创建者尝试用错误的工作者地址验证工作量证明应该失败
        address wrongWorker = address(0x4);
        vm.prank(taskCreator);
        vm.expectRevert(FixedPaymentTask.FixedPaymentTask_NoWorkerAssigned.selector);
        fixedPaymentTask.approveProofOfWork(1, wrongWorker);
    }
}
