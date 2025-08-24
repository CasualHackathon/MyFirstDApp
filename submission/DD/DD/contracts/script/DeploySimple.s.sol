// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DDToken.sol";
import "../src/DDProjectFactory.sol";

contract DeploySimple is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== Deploying DD Project Contracts ===");
        console.log("Deployer address:", deployer);
        console.log("Network Chain ID:", block.chainid);
        
        // 1. 部署DD代币合约
        console.log("\n1. Deploying DDToken...");
        DDToken ddToken = new DDToken();
        console.log("DDToken deployed at:", address(ddToken));
        console.log("Token name:", ddToken.name());
        console.log("Token symbol:", ddToken.symbol());
        console.log("Total supply:", ddToken.totalSupply());
        
        // 铸造一些代币给部署者用于测试
        uint256 initialMint = 1000000 * 10**18; // 100万DD代币
        ddToken.mint(deployer, initialMint);
        console.log("Minted", initialMint / 10**18, "DD tokens to deployer");
        
        // 2. 部署DD项目工厂合约
        console.log("\n2. Deploying DDProjectFactory...");
        DDProjectFactory ddProjectFactory = new DDProjectFactory(address(ddToken));
        console.log("DDProjectFactory deployed at:", address(ddProjectFactory));
        
        // 3. 设置角色权限
        console.log("\n3. Configuring permissions...");
        bytes32 vaultRole = ddToken.VAULT_ROLE();
        ddToken.grantRole(vaultRole, address(ddProjectFactory));
        console.log("Granted VAULT_ROLE to DDProjectFactory");
        
        // 验证权限设置
        bool hasRole = ddToken.hasRole(vaultRole, address(ddProjectFactory));
        console.log("VAULT_ROLE verification:", hasRole ? "successful" : "failed");
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("DDToken:", address(ddToken));
        console.log("DDProjectFactory:", address(ddProjectFactory));
        console.log("Deployer:", deployer);
        console.log("Network:", block.chainid);
        console.log("Block:", block.number);
        console.log("Timestamp:", block.timestamp);
        
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
            "\n=== Ready to Use ===", "\n",
            "Use DDProjectFactory.createProject() to create new project contracts", "\n",
            "Each project will have its own contract instance with form data", "\n",
            "Staking and vault functions are integrated in DDToken contract"
        );
        
        vm.writeFile("deployment_summary.txt", deploymentInfo);
        console.log("Deployment info saved to deployment_summary.txt");
        
        console.log("\n=== Environment Variables to Add ===");
        console.log("DDTOKEN_ADDRESS=", address(ddToken));
        console.log("DDPROJECTFACTORY_ADDRESS=", address(ddProjectFactory));
        
        console.log("\n=== Ready to Use ===");
        console.log("DDToken and DDProjectFactory contracts deployed successfully!");
        console.log("You can now create projects using the factory");
    }
}
