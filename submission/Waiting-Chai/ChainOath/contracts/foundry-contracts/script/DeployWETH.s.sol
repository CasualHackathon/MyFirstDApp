// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/WETH.sol";

contract DeployWETH is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy WETH contract
        WETH weth = new WETH();
        
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("=== WETH Deployment Summary ===");
        console.log("WETH Contract Address:", address(weth));
        console.log("WETH Name:", weth.name());
        console.log("WETH Symbol:", weth.symbol());
        console.log("WETH Decimals:", weth.decimals());
        console.log("================================");
        
        // Frontend configuration
        console.log("\n=== Frontend Configuration ===");
        console.log("Add to config.ts:");
        console.log("WETH_ADDRESS: '%s'", address(weth));
        console.log("================================");
    }
}