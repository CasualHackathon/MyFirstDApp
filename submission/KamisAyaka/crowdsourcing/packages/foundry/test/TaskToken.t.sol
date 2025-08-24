// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/TaskToken.sol";

contract TaskTokenTest is Test {
    TaskToken public taskToken;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);

        // 部署TaskToken合约
        taskToken = new TaskToken("Task Token", "TASK", 18);
    }

    // 测试合约部署
    function testDeployment() public view {
        assertEq(taskToken.name(), "Task Token");
        assertEq(taskToken.symbol(), "TASK");
        assertEq(taskToken.decimals(), 18);
        assertEq(taskToken.owner(), owner);
    }

    // 测试铸造代币
    function testMint() public {
        uint256 amount = 1000 * 10 ** 18;
        taskToken.mint(user1, amount);

        assertEq(taskToken.balanceOf(user1), amount);
        assertEq(taskToken.totalSupply(), amount);
    }

    // 测试只有所有者可以铸造代币
    function testMintOnlyOwner() public {
        uint256 amount = 1000 * 10 ** 18;
        vm.prank(user1); // 切换到user1地址
        vm.expectRevert(); // 期望调用会回滚
        taskToken.mint(user1, amount);
    }

    // 测试销毁代币
    function testBurn() public {
        uint256 mintAmount = 1000 * 10 ** 18;
        uint256 burnAmount = 300 * 10 ** 18;

        taskToken.mint(user1, mintAmount);
        vm.prank(user1);
        taskToken.burn(burnAmount);

        assertEq(taskToken.balanceOf(user1), mintAmount - burnAmount);
        assertEq(taskToken.totalSupply(), mintAmount - burnAmount);
    }

    // 测试授权任务合约使用代币
    function testApproveTaskContract() public {
        uint256 amount = 500 * 10 ** 18;
        address taskContract = address(0x1234);

        taskToken.mint(user1, amount);
        vm.prank(user1);
        taskToken.approveTaskContract(taskContract, amount);

        assertEq(taskToken.allowance(user1, taskContract), amount);
    }
}
