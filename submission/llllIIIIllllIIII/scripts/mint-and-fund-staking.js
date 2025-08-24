import 'dotenv/config';
import hre from "hardhat";
import fs from 'fs';

async function main() {
  console.log("開始 mint Token A 並為質押合約添加獎勵...");

  // 取得 deployer wallet
  const provider = new hre.ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length !== 64) {
    throw new Error('Invalid PRIVATE_KEY in .env，請確認為 64 字元純 hex 並無 0x 前綴');
  }
  const deployer = new hre.ethers.Wallet(privateKey, provider);
  
  console.log("錢包地址:", deployer.address);
  const balance = await provider.getBalance(deployer.address);
  console.log("錢包餘額:", hre.ethers.formatEther(balance), "ETH");

  // 讀取合約地址
  let contractAddresses;
  try {
    const addressesData = fs.readFileSync('./contractAddresses.json', 'utf8');
    contractAddresses = JSON.parse(addressesData);
  } catch (error) {
    console.error("請先執行部署腳本生成 contractAddresses.json");
    process.exit(1);
  }

  // 連接到已部署的合約
  const TestToken = await hre.ethers.getContractFactory("TestToken", deployer);
  const SimpleStaking = await hre.ethers.getContractFactory("SimpleStaking", deployer);

  const tokenA = TestToken.attach(contractAddresses.tokenA);
  const rewardToken = TestToken.attach(contractAddresses.rewardToken);
  const staking = SimpleStaking.attach(contractAddresses.staking);

  console.log("\n連接到合約:");
  console.log("TokenA (TUSDC):", await tokenA.getAddress());
  console.log("RewardToken:", await rewardToken.getAddress());
  console.log("SimpleStaking:", await staking.getAddress());

  // 1. Mint 大量 Token A 到部署錢包
  console.log("\n1. Mint 大量 Token A 到部署錢包...");
  const mintAmount = hre.ethers.parseEther("1000000"); // 1,000,000 Token A
  
  // 檢查當前 Token A 餘額
  const currentTokenABalance = await tokenA.balanceOf(deployer.address);
  console.log("當前 Token A 餘額:", hre.ethers.formatEther(currentTokenABalance));

  // Mint Token A
  const mintTx = await tokenA.connect(deployer).mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log("✅ 成功 mint", hre.ethers.formatEther(mintAmount), "Token A");

  // 檢查 mint 後的餘額
  const newTokenABalance = await tokenA.balanceOf(deployer.address);
  console.log("Mint 後 Token A 餘額:", hre.ethers.formatEther(newTokenABalance));

  // 2. Mint 更多獎勵代幣並添加到質押合約
  console.log("\n2. Mint 更多獎勵代幣並添加到質押合約...");
  const rewardMintAmount = hre.ethers.parseEther("500000"); // 500,000 Reward Token
  
  // 檢查當前獎勵代幣餘額
  const currentRewardBalance = await rewardToken.balanceOf(deployer.address);
  console.log("當前獎勵代幣餘額:", hre.ethers.formatEther(currentRewardBalance));

  // Mint 獎勵代幣
  const rewardMintTx = await rewardToken.connect(deployer).mint(deployer.address, rewardMintAmount);
  await rewardMintTx.wait();
  console.log("✅ 成功 mint", hre.ethers.formatEther(rewardMintAmount), "獎勵代幣");

  // 檢查質押合約當前的獎勵池
  const stakingInfo = await staking.getContractInfo();
  console.log("質押合約當前狀態:");
  console.log("- 總質押量:", hre.ethers.formatEther(stakingInfo[0]));
  console.log("- 總獎勵池:", hre.ethers.formatEther(stakingInfo[1]));
  console.log("- 獎勵率:", stakingInfo[2].toString());

  // 3. 將獎勵代幣添加到質押合約
  console.log("\n3. 將獎勵代幣添加到質押合約...");
  const addRewardAmount = hre.ethers.parseEther("300000"); // 300,000 獎勵代幣

  // 先授權質押合約使用獎勵代幣
  const approveTx = await rewardToken.connect(deployer).approve(await staking.getAddress(), addRewardAmount);
  await approveTx.wait();
  console.log("✅ 已授權質押合約使用", hre.ethers.formatEther(addRewardAmount), "獎勵代幣");

  // 添加獎勵代幣到質押合約
  const addRewardTx = await staking.connect(deployer).addRewards(addRewardAmount);
  await addRewardTx.wait();
  console.log("✅ 成功添加", hre.ethers.formatEther(addRewardAmount), "獎勵代幣到質押合約");

  // 檢查更新後的狀態
  const updatedStakingInfo = await staking.getContractInfo();
  console.log("\n質押合約更新後狀態:");
  console.log("- 總質押量:", hre.ethers.formatEther(updatedStakingInfo[0]));
  console.log("- 總獎勵池:", hre.ethers.formatEther(updatedStakingInfo[1]));
  console.log("- 獎勵率:", updatedStakingInfo[2].toString());

  // 最終餘額檢查
  console.log("\n最終餘額檢查:");
  const finalTokenABalance = await tokenA.balanceOf(deployer.address);
  const finalRewardBalance = await rewardToken.balanceOf(deployer.address);
  const stakingRewardBalance = await rewardToken.balanceOf(await staking.getAddress());
  
  console.log("部署錢包 Token A 餘額:", hre.ethers.formatEther(finalTokenABalance));
  console.log("部署錢包獎勵代幣餘額:", hre.ethers.formatEther(finalRewardBalance));
  console.log("質押合約獎勵代幣餘額:", hre.ethers.formatEther(stakingRewardBalance));

  console.log("\n🎉 任務完成！");
  console.log("=====================================");
  console.log("✅ 已 mint 1,000,000 Token A 到部署錢包");
  console.log("✅ 已 mint 500,000 獎勵代幣到部署錢包");
  console.log("✅ 已添加 300,000 獎勵代幣到質押合約");
  console.log("✅ 質押合約現在有充足的獎勵代幣供用戶領取");
  console.log("=====================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
