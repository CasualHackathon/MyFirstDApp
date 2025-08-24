import 'dotenv/config';
import hre from "hardhat";
import fs from 'fs';

async function main() {
  console.log("為質押合約添加獎勵代幣...");

  const provider = new hre.ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
  const privateKey = process.env.PRIVATE_KEY;
  const deployer = new hre.ethers.Wallet(privateKey, provider);
  
  console.log("錢包地址:", deployer.address);

  // 讀取合約地址
  const addressesData = fs.readFileSync('./contractAddresses.json', 'utf8');
  const contractAddresses = JSON.parse(addressesData);

  // 連接到合約
  const TestToken = await hre.ethers.getContractFactory("TestToken", deployer);
  const SimpleStaking = await hre.ethers.getContractFactory("SimpleStaking", deployer);

  const rewardToken = TestToken.attach(contractAddresses.rewardToken);
  const staking = SimpleStaking.attach(contractAddresses.staking);

  console.log("獎勵代幣合約:", await rewardToken.getAddress());
  console.log("質押合約:", await staking.getAddress());

  // 添加 500,000 獎勵代幣到質押合約
  const addRewardAmount = hre.ethers.parseEther("500000");
  
  console.log("\n步驟 1: 授權質押合約使用獎勵代幣...");
  const approveTx = await rewardToken.connect(deployer).approve(await staking.getAddress(), addRewardAmount);
  await approveTx.wait();
  console.log("✅ 授權完成");

  console.log("\n步驟 2: 添加獎勵代幣到質押合約...");
  const addRewardTx = await staking.connect(deployer).addRewards(addRewardAmount);
  await addRewardTx.wait();
  console.log("✅ 獎勵添加完成");

  // 檢查最終狀態
  const stakingInfo = await staking.getContractInfo();
  const stakingRewardBalance = await rewardToken.balanceOf(await staking.getAddress());
  
  console.log("\n🎉 完成！最終狀態:");
  console.log("質押合約獎勵代幣餘額:", hre.ethers.formatEther(stakingRewardBalance));
  console.log("質押合約總獎勵池:", hre.ethers.formatEther(stakingInfo[1]));
  console.log("現在用戶可以開始質押並獲得獎勵了！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
