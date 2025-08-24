// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter();
        counter.setNumber(0);
    }

    function test_Increment() public {
        counter.increment();
        assertEq(counter.number(), 1);
    }

    function testFuzz_SetNumber(uint256 x) public {
        counter.setNumber(x);
        assertEq(counter.number(), x);
    }

    function test_TransferEther() public {
        // 1) 先给测试合约资金，再充值到被测合约
        vm.deal(address(this), 2 ether);
        counter.deposit{value: 1 ether}();

        // 2) 选择一个收款地址，并记录初始余额
        address payable recipient = payable(vm.addr(1));
        uint256 recipientBefore = recipient.balance;
        uint256 counterBefore = address(counter).balance;

        // 3) 作为 owner 调用转账
        bool ok = counter.transferEther(recipient, 0.6 ether);
        assertTrue(ok);

        // 4) 断言余额变化
        assertEq(address(counter).balance, counterBefore - 0.6 ether);
        assertEq(recipient.balance, recipientBefore + 0.6 ether);
    }

    function test_TriggerPayout() public {
        // 1) 准备合约余额
        vm.deal(address(this), 3 ether);
        counter.deposit{value: 2 ether}();

        // 2) 配置固定收款人与金额（owner 为本测试合约地址）
        address payable recipient = payable(vm.addr(2));
        counter.setPayoutConfig(recipient, 0.7 ether);

        // 3) 记录余额并由任意调用者触发
        uint256 counterBefore = address(counter).balance;
        uint256 recipientBefore = recipient.balance;

        // 使用另一个外部地址作为调用者
        address caller = vm.addr(3);
        vm.prank(caller);
        bool ok = counter.triggerPayout();
        assertTrue(ok);

        // 4) 断言余额变化
        assertEq(address(counter).balance, counterBefore - 0.7 ether);
        assertEq(recipient.balance, recipientBefore + 0.7 ether);
    }
}
