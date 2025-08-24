// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/BaseTask.sol";
import "../contracts/TaskToken.sol";
import "../contracts/DisputeResolver.sol";
import "../contracts/UserInfo.sol";
import "../contracts/interface/IDisputeResolver.sol";

// 创建一个简单的实现合约来测试BaseTask的抽象功能
contract TestBaseTask is BaseTask {
    constructor(IERC20 _taskToken, IDisputeResolver _disputeResolver) BaseTask(_taskToken, _disputeResolver) { }

    function createTask(string memory _title, string memory _description, uint256 _deadline) public override {
        taskCounter++;
        Task storage newTask = tasks[taskCounter];
        newTask.id = taskCounter;
        newTask.creator = payable(msg.sender);
        newTask.title = _title;
        newTask.description = _description;
        newTask.deadline = _deadline;
        newTask.status = TaskStatus.Open;
        newTask.createdAt = block.timestamp;
    }

    function terminateTask(uint256 _taskId) public override {
        Task storage task = tasks[_taskId];
        task.status = TaskStatus.Cancelled;
    }

    function addWorker(uint256 _taskId, address _worker, uint256 _reward) public override {
        // 简单实现
    }
}

contract BaseTaskTest is Test {
    TestBaseTask public baseTask;
    TaskToken public taskToken;
    DisputeResolver public disputeResolver;
    UserInfo public userInfo;

    address public owner;
    address public taskCreator;
    address public worker;

    uint256 public constant PLATFORM_FEE = 100; // 1%
    uint256 public constant REWARD_AMOUNT = 1000 * 10 ** 18;

    function setUp() public {
        owner = address(this);
        taskCreator = address(0x1);
        worker = address(0x2);

        // 部署TaskToken合约
        taskToken = new TaskToken("Task Token", "TASK", 18);

        // 为用户铸造代币
        taskToken.mint(taskCreator, REWARD_AMOUNT * 10);

        // 部署DisputeResolver合约
        disputeResolver = new DisputeResolver(taskToken);

        // 部署UserInfo合约
        userInfo = new UserInfo();

        // 部署BaseTask合约
        baseTask = new TestBaseTask(taskToken, IDisputeResolver(address(disputeResolver)));
    }

    // 测试合约部署
    function testDeployment() public view {
        assertEq(baseTask.owner(), owner);
        assertEq(address(baseTask.taskToken()), address(taskToken));
        assertEq(address(baseTask.disputeResolver()), address(disputeResolver));
        assertEq(baseTask.platformFee(), PLATFORM_FEE);
    }

    // 测试创建任务
    function testCreateTask() public {
        vm.prank(taskCreator);
        baseTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        (
            uint256 id,
            address creator,
            string memory title,
            string memory description,
            uint256 reward,
            uint256 deadline,
            BaseTask.TaskStatus status,
            uint256 createdAt
        ) = baseTask.tasks(1);

        assertEq(id, 1);
        assertEq(creator, taskCreator);
        assertEq(title, "Test Task");
        assertEq(description, "Test Description");
        assertEq(reward, 0);
        assertEq(deadline, block.timestamp + 1 days);
        assertEq(uint8(status), uint8(BaseTask.TaskStatus.Open));
        assertGt(createdAt, 0);
        assertEq(baseTask.taskCounter(), 1);
    }

    // 测试更新平台费用
    function testUpdatePlatformFee() public {
        // 只有所有者可以更新平台费用
        vm.prank(owner);
        baseTask.updatePlatformFee(200); // 2%

        assertEq(baseTask.platformFee(), 200);
    }

    // 测试更新平台费用过高
    function testUpdatePlatformFeeTooHigh() public {
        // 尝试设置过高的费用应该失败
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(BaseTask.FeeTooHigh.selector, 1001));
        baseTask.updatePlatformFee(1001); // 超过10%应该失败
    }

    // 测试非所有者更新平台费用
    function testUpdatePlatformFeeOnlyOwner() public {
        address notOwner = address(0x3);
        vm.prank(notOwner);
        vm.expectRevert();
        baseTask.updatePlatformFee(200);
    }

    // 测试暂停和恢复合约
    function testPauseUnpause() public {
        // 只有所有者可以暂停合约
        vm.prank(owner);
        baseTask.pause();

        assertTrue(baseTask.paused());

        // 只有所有者可以恢复合约
        vm.prank(owner);
        baseTask.unpause();

        assertFalse(baseTask.paused());
    }

    // 测试非所有者暂停合约
    function testPauseOnlyOwner() public {
        address notOwner = address(0x3);
        vm.prank(notOwner);
        vm.expectRevert();
        baseTask.pause();
    }

    // 测试提取平台收入
    function testWithdrawPlatformRevenue() public {
        // 设置一些平台收入
        vm.prank(owner);
        baseTask.updatePlatformFee(100); // 1%

        // 由于BaseTask是抽象合约，我们无法直接测试完整的收入流程
        // 这里只是验证函数的基本逻辑
        vm.expectRevert(BaseTask.NoRevenueToWithdraw.selector);
        vm.prank(owner);
        baseTask.withdrawPlatformRevenue();
    }

    // 测试修改截止时间
    function testChangeDeadline() public {
        // 创建任务
        vm.prank(taskCreator);
        baseTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 任务创建者修改截止时间
        vm.prank(taskCreator);
        baseTask.changedeadline(1, block.timestamp + 2 days);

        (,,,,, uint256 newDeadline,,) = baseTask.tasks(1);
        assertEq(newDeadline, block.timestamp + 2 days);
    }

    // 测试修改截止时间为更早的时间
    function testChangeDeadlineInvalid() public {
        // 创建任务
        vm.prank(taskCreator);
        baseTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 尝试将截止时间修改为更早的时间应该失败
        vm.prank(taskCreator);
        vm.expectRevert(BaseTask.InvalidDeadline.selector);
        baseTask.changedeadline(1, block.timestamp);
    }

    // 测试非任务创建者修改截止时间
    function testChangeDeadlineOnlyTaskCreator() public {
        // 创建任务
        vm.prank(taskCreator);
        baseTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 非任务创建者尝试修改截止时间应该失败
        address notCreator = address(0x3);
        vm.prank(notCreator);
        vm.expectRevert(abi.encodeWithSelector(BaseTask.OnlyTaskCreator.selector, notCreator, 1));
        baseTask.changedeadline(1, block.timestamp + 2 days);
    }

    // 测试增加奖励
    function testIncreaseReward() public {
        // 创建任务
        vm.prank(taskCreator);
        baseTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        uint256 initialBalance = taskToken.balanceOf(address(baseTask));

        // 授权
        vm.prank(taskCreator);
        taskToken.approve(address(baseTask), REWARD_AMOUNT);

        // 任务创建者增加奖励
        vm.prank(taskCreator);
        baseTask.increaseReward(1, REWARD_AMOUNT);

        (,,,, uint256 newReward,,,) = baseTask.tasks(1);
        assertEq(newReward, REWARD_AMOUNT);
        assertEq(taskToken.balanceOf(address(baseTask)), initialBalance + REWARD_AMOUNT);
    }

    // 测试增加奖励为0
    function testIncreaseRewardZero() public {
        // 创建任务
        vm.prank(taskCreator);
        baseTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 尝试增加0奖励应该失败
        vm.prank(taskCreator);
        vm.expectRevert(BaseTask.RewardMoreThanZero.selector);
        baseTask.increaseReward(1, 0);
    }

    // 测试非任务创建者增加奖励
    function testIncreaseRewardOnlyTaskCreator() public {
        // 创建任务
        vm.prank(taskCreator);
        baseTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        // 非任务创建者尝试增加奖励应该失败
        address notCreator = address(0x3);
        vm.prank(notCreator);
        vm.expectRevert(abi.encodeWithSelector(BaseTask.OnlyTaskCreator.selector, notCreator, 1));
        baseTask.increaseReward(1, REWARD_AMOUNT);
    }

    // 测试获取任务详情
    function testGetTask() public {
        // 创建任务
        vm.prank(taskCreator);
        baseTask.createTask("Test Task", "Test Description", block.timestamp + 1 days);

        BaseTask.Task memory task = baseTask.getTask(1);

        assertEq(task.id, 1);
        assertEq(task.creator, taskCreator);
        assertEq(task.title, "Test Task");
        assertEq(task.description, "Test Description");
        assertEq(task.totalreward, 0);
        assertEq(task.deadline, block.timestamp + 1 days);
        assertEq(uint8(task.status), uint8(BaseTask.TaskStatus.Open));
        assertGt(task.createdAt, 0);
    }
}
