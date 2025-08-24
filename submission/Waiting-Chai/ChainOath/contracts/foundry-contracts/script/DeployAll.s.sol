// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ChainOathSecure.sol";
import "../src/ChainOathNFT.sol";

/**
 * ChainOath完整系统部署脚本
 * 部署ChainOathSecure主合约和ChainOathNFT成就合约，并设置合约间关联
 * 使用方法:
 * forge script script/DeployAll.s.sol --rpc-url https://sepolia.infura.io/v3/YOUR_API_KEY --broadcast --verify
 */
contract DeployAll is Script {
    function run() external {
        // 使用指定的私钥
        uint256 deployerPrivateKey = 0xf6dfe4824a2dd594a3aead5f65a5a922fa210ebaa6789b5305e48391848f15c1;
        address deployerAddress = 0xA0C7D67A861f2dD7a2EB4Acf114d568F76131447;
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== Starting ChainOath System Deployment ===");
        console.log("Deployer Address:", deployerAddress);
        console.log("Network: Sepolia Testnet");
        console.log("");
        
        // 1. 部署ChainOathSecure主合约
        console.log("Step 1: Deploying ChainOathSecure contract...");
        ChainOathSecure chainOathSecure = new ChainOathSecure();
        console.log("[SUCCESS] ChainOathSecure deployed at:", address(chainOathSecure));
        console.log("  Block Explorer: https://sepolia.etherscan.io/address/%s", address(chainOathSecure));
        console.log("");
        
        // 2. 部署ChainOathNFT成就合约
        console.log("Step 2: Deploying ChainOathNFT contract...");
        ChainOathNFT chainOathNFT = new ChainOathNFT();
        console.log("[SUCCESS] ChainOathNFT deployed at:", address(chainOathNFT));
        console.log("  Block Explorer: https://sepolia.etherscan.io/address/%s", address(chainOathNFT));
        console.log("");
        
        // 3. 设置合约间关联
        console.log("Step 3: Setting up contract associations...");
        
        // 在ChainOathSecure中设置NFT合约地址
        console.log("  Setting NFT contract in ChainOathSecure...");
        chainOathSecure.setNFTContract(address(chainOathNFT));
        console.log("  [SUCCESS] NFT contract address set in ChainOathSecure");
        
        // 在ChainOathNFT中设置主合约地址
        console.log("  Setting Oath contract in ChainOathNFT...");
        chainOathNFT.setOathContract(address(chainOathSecure));
        console.log("  [SUCCESS] Oath contract address set in ChainOathNFT");
        console.log("");
        
        // 4. 验证合约关联
        console.log("Step 4: Verifying contract associations...");
        address nftContractInSecure = chainOathSecure.nftContract();
        address oathContractInNFT = chainOathNFT.oathContract();
        
        require(nftContractInSecure == address(chainOathNFT), "NFT contract not properly set in ChainOathSecure");
        require(oathContractInNFT == address(chainOathSecure), "Oath contract not properly set in ChainOathNFT");
        
        console.log("  [SUCCESS] Contract associations verified");
        console.log("");
        
        // 5. 验证成就阈值设置（测试友好的低难度）
        console.log("Step 5: Verifying achievement thresholds...");
        console.log("  FIRST_OATH threshold:", chainOathNFT.achievementThresholds(ChainOathNFT.AchievementType.FIRST_OATH));
        console.log("  EARLY_ADOPTER threshold:", chainOathNFT.achievementThresholds(ChainOathNFT.AchievementType.EARLY_ADOPTER));
        console.log("  OATH_KEEPER threshold:", chainOathNFT.achievementThresholds(ChainOathNFT.AchievementType.OATH_KEEPER));
        console.log("  TRUSTED_CREATER threshold:", chainOathNFT.achievementThresholds(ChainOathNFT.AchievementType.TRUSTED_CREATER));
        console.log("  COMMUNITY_STAR threshold:", chainOathNFT.achievementThresholds(ChainOathNFT.AchievementType.COMMUNITY_STAR));
        console.log("  MILESTONE_MASTER threshold:", chainOathNFT.achievementThresholds(ChainOathNFT.AchievementType.MILESTONE_MASTER));
        console.log("");
        
        // 6. 输出部署摘要
        console.log("=== Deployment Summary ===");
        console.log("ChainOathSecure Address:", address(chainOathSecure));
        console.log("ChainOathNFT Address:", address(chainOathNFT));
        console.log("Deployer Address:", deployerAddress);
        console.log("Network: Sepolia Testnet");
        console.log("Contract Owner:", chainOathSecure.owner());
        console.log("NFT Contract Owner:", chainOathNFT.owner());
        console.log("");
        
        // 7. 输出前端配置信息
        console.log("=== Frontend Configuration ===");
        console.log("Add these addresses to your frontend configuration:");
        console.log("CHAIN_OATH_SECURE_ADDRESS=%s", address(chainOathSecure));
        console.log("CHAIN_OATH_NFT_ADDRESS=%s", address(chainOathNFT));
        console.log("");
        
        console.log("=== Next Steps ===");
        console.log("1. Verify contracts on Etherscan using the addresses above");
        console.log("2. Update frontend ChainOathABI.ts with new contract addresses");
        console.log("3. Test contract interactions on Sepolia testnet");
        console.log("4. Create test oaths to verify achievement system");
        console.log("5. Test social features (likes, comments)");
        
        vm.stopBroadcast();
    }
}