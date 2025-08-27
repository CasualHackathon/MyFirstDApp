// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/DDToken.sol";

contract DeployDDTokenScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== Deploying DDToken Contract ===");
        console.log("Deployer address:");
        console.log(deployer);
        console.log("Network: Sepolia Testnet");
        console.log("Chain ID:");
        console.log(block.chainid);
        
        // 部署DD代币合约
        console.log("\n1. Deploying DDToken...");
        DDToken ddToken = new DDToken();
        console.log("DDToken deployed at:");
        console.log(address(ddToken));
        console.log("   Name:");
        console.log(ddToken.name());
        console.log("   Symbol:");
        console.log(ddToken.symbol());
        console.log("   Total supply:");
        console.log(ddToken.totalSupply());
        
        // 铸造一些代币给部署者用于测试
        uint256 initialMint = 1000000 * 10**18; // 100万DD代币
        ddToken.mint(deployer, initialMint);
        console.log("Minted");
        console.log(initialMint / 10**18);
        console.log("DD tokens to deployer");
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("DDToken:");
        console.log(address(ddToken));
        console.log("Deployer:");
        console.log(deployer);
        console.log("Network:");
        console.log(block.chainid);
        console.log("Block:");
        console.log(block.number);
        console.log("Timestamp:");
        console.log(block.timestamp);
        
        // 保存部署信息到文件
        string memory deploymentInfo = string.concat(
            "DDToken Deployment Summary", "\n",
            "================================", "\n",
            "DDToken deployed at: ", vm.toString(address(ddToken)), "\n",
            "Deployer: ", vm.toString(deployer), "\n",
            "Network: ", vm.toString(block.chainid), "\n",
            "Block: ", vm.toString(block.number), "\n",
            "Timestamp: ", vm.toString(block.timestamp), "\n",
            "\n=== Environment Variables to Add ===", "\n",
            "DDTOKEN_ADDRESS=", vm.toString(address(ddToken)), "\n",
            "\n=== Token Ready ===", "\n",
            "DDToken contract is ready for use", "\n",
            "Staking and vault functions are integrated"
        );
        
        vm.writeFile("ddtoken_deployment_summary.txt", deploymentInfo);
        console.log("Deployment info saved to ddtoken_deployment_summary.txt");
        
        console.log("\n=== Environment Variables to Add ===");
        console.log("DDTOKEN_ADDRESS=");
        console.log(address(ddToken));
        
        console.log("\n=== Ready to Use ===");
        console.log("DDToken contract deployed successfully!");
        console.log("Staking and vault functions are integrated");
    }
}
