// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/DDToken.sol";
import "../src/DDProjectFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== Deploying DD Project Contracts ===");
        console.log("Deployer address:");
        console.log(deployer);
        console.log("Network: Sepolia Testnet");
        console.log("Chain ID:");
        console.log(block.chainid);
        
        // 1. 部署DD代币合约（包含金库功能）
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
        
        // 2. 部署DD项目工厂合约
        console.log("\n2. Deploying DDProjectFactory...");
        DDProjectFactory ddProjectFactory = new DDProjectFactory(address(ddToken));
        console.log("DDProjectFactory deployed at:");
        console.log(address(ddProjectFactory));
        
        // 3. 设置角色权限
        console.log("\n3. Configuring permissions...");
        bytes32 vaultRole = ddToken.VAULT_ROLE();
        ddToken.grantRole(vaultRole, address(ddProjectFactory));
        console.log("Granted VAULT_ROLE to DDProjectFactory");
        
        // 验证权限设置
        if (ddToken.hasRole(vaultRole, address(ddProjectFactory))) {
            console.log("VAULT_ROLE verification successful");
        } else {
            console.log("VAULT_ROLE verification failed");
        }
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("DDToken:");
        console.log(address(ddToken));
        console.log("DDProjectFactory:");
        console.log(address(ddProjectFactory));
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
            "DD Project Deployment Summary", "\n",
            "================================", "\n",
            "DDToken deployed at: ", vm.toString(address(ddToken)), "\n",
            "DDProjectFactory deployed at: ", vm.toString(address(ddProjectFactory)), "\n",
            "Deployer: ", vm.toString(deployer), "\n",
            "Network: ", vm.toString(block.chainid), "\n",
            "Block: ", vm.toString(block.number), "\n",
            "Timestamp: ", vm.toString(block.timestamp), "\n",
            "\n=== Environment Variables to Add ===", "\n",
            "DDTOKEN_ADDRESS=", vm.toString(address(ddToken)), "\n",
            "DDPROJECTFACTORY_ADDRESS=", vm.toString(address(ddProjectFactory)), "\n",
            "\n=== Factory Mode Ready ===", "\n",
            "Use DDProjectFactory.createProject() to create new project contracts", "\n",
            "Each project will have its own contract instance with form data", "\n",
            "Staking and vault functions are integrated in DDToken contract"
        );
        
        vm.writeFile("deployment_summary.txt", deploymentInfo);
        console.log("Deployment info saved to deployment_summary.txt");
        
        console.log("\n=== Environment Variables to Add ===");
        console.log("DDTOKEN_ADDRESS=");
        console.log(address(ddToken));
        console.log("DDPROJECTFACTORY_ADDRESS=");
        console.log(address(ddProjectFactory));
        
        console.log("\n=== Ready to Use ===");
        console.log("All contracts deployed and configured successfully!");
        console.log("You can now create projects using the factory");
        console.log("Staking and vault functions are integrated");
    }
}
