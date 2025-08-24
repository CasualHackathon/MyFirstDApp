// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {AuditEscrow} from "../src/AuditEscrow.sol";

/**
 * Usage (Sepolia):
 *  - Provide RPC_URL, PRIVATE_KEY and SERVICE_ADDRESS via env/CI.
 *  - forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --broadcast --verify
 */
contract Deploy is Script {
    function run() external {
        address service = vm.envAddress("SERVICE_ADDRESS");
        vm.startBroadcast();
        AuditEscrow esc = new AuditEscrow(service);
        console2.log("AuditEscrow deployed at:", address(esc));
        vm.stopBroadcast();
    }
}
