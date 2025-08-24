// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";

/**
 * @title Deploy
 * @dev 部署 Counter 合约的脚本
 */
contract Deploy is Script {
    Counter public counter;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        counter = new Counter();

        vm.stopBroadcast();
    }
}

/**
 * @title CounterIntegration
 * @notice 基于 anvil 的集成调用脚本：部署 -> 充值 -> 配置 -> 触发转账
 */
contract CounterIntegration is Script {
    /**
     * @notice 从环境变量读取 `PAYOUT_RECIPIENT`, `PAYOUT_AMOUNT`, `DEPOSIT_AMOUNT`
     */
    function run() public {
        vm.startBroadcast();

        // 1) 部署
        Counter counter = new Counter();

        // 2) 充值
        uint256 depositAmount = vm.envUint("DEPOSIT_AMOUNT");
        (bool sentDeposit, ) = address(counter).call{value: depositAmount}("");
        require(sentDeposit, "deposit failed");

        // 3) 配置收款人与固定金额
        address payable recipient = payable(vm.envAddress("PAYOUT_RECIPIENT"));
        uint256 payoutAmount = vm.envUint("PAYOUT_AMOUNT");
        counter.setPayoutConfig(recipient, payoutAmount);

        // 4) 触发转账（可多次）
        bool ok = counter.triggerPayout();
        require(ok, "trigger failed");

        console.log("Counter:", address(counter));
        console.log("Recipient:", recipient);
        console.log("PayoutAmount:", payoutAmount);
        console.log("CounterBalance:", address(counter).balance);

        vm.stopBroadcast();
    }
}
