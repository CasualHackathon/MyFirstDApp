import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  // Get the deployer/owner account
  const [deployer] = await ethers.getSigners();
  console.log("Setting up staking rewards with account:", deployer.address);

  // Contract addresses
  const REWARD_TOKEN_ADDRESS = "0x1d54edb6f8975777cF7a9932c58D8e7d4d93F986";
  const SIMPLE_STAKING_ADDRESS = "0x9C3A90611f2a4413F95ef70E43b8DbC06EEd1329";

  // Get contract instances
  const RewardToken = await ethers.getContractAt("TestToken", REWARD_TOKEN_ADDRESS);
  const SimpleStaking = await ethers.getContractAt("SimpleStaking", SIMPLE_STAKING_ADDRESS);

  console.log("\n=== 檢查當前狀態 ===");
  
  // Check current reward token balance of deployer
  const deployerRewardBalance = await RewardToken.balanceOf(deployer.address);
  console.log(`部署錢包 Reward Token 餘額: ${ethers.formatEther(deployerRewardBalance)}`);

  // Check current reward token balance in staking contract
  const stakingRewardBalance = await RewardToken.balanceOf(SIMPLE_STAKING_ADDRESS);
  console.log(`質押合約 Reward Token 餘額: ${ethers.formatEther(stakingRewardBalance)}`);

  console.log("\n=== 開始 Mint Reward Token ===");
  
  // Mint a large amount of reward tokens (10 million tokens)
  const mintAmount = ethers.parseEther("10000000"); // 10 million tokens
  console.log(`正在 mint ${ethers.formatEther(mintAmount)} Reward Tokens...`);
  
  try {
    const mintTx = await RewardToken.mint(deployer.address, mintAmount);
    await mintTx.wait();
    console.log("✅ Mint 成功!");
    console.log(`交易哈希: ${mintTx.hash}`);
  } catch (error) {
    console.log("⚠️ Mint 失敗或已經執行過:", error.message);
  }

  // Check balance after minting
  const newDeployerBalance = await RewardToken.balanceOf(deployer.address);
  console.log(`Mint 後部署錢包餘額: ${ethers.formatEther(newDeployerBalance)}`);

  console.log("\n=== 添加獎勵到質押合約 ===");
  
  // Add rewards to staking contract (1 million tokens for rewards)
  const rewardAmount = ethers.parseEther("1000000"); // 1 million tokens for rewards
  console.log(`正在添加 ${ethers.formatEther(rewardAmount)} Reward Tokens 到質押合約...`);

  try {
    // First approve the staking contract to spend reward tokens
    const approveTx = await RewardToken.approve(SIMPLE_STAKING_ADDRESS, rewardAmount);
    await approveTx.wait();
    console.log("✅ 授權成功!");

    // Add rewards to staking contract
    const addRewardsTx = await SimpleStaking.addRewards(rewardAmount);
    await addRewardsTx.wait();
    console.log("✅ 添加獎勵成功!");
    console.log(`交易哈希: ${addRewardsTx.hash}`);
  } catch (error) {
    console.log("⚠️ 添加獎勵失敗:", error.message);
  }

  console.log("\n=== 最終狀態檢查 ===");
  
  // Final balance checks
  const finalDeployerBalance = await RewardToken.balanceOf(deployer.address);
  const finalStakingBalance = await RewardToken.balanceOf(SIMPLE_STAKING_ADDRESS);
  
  console.log(`部署錢包最終 Reward Token 餘額: ${ethers.formatEther(finalDeployerBalance)}`);
  console.log(`質押合約最終 Reward Token 餘額: ${ethers.formatEther(finalStakingBalance)}`);

  // Check total reward pool in staking contract
  try {
    const totalRewards = await SimpleStaking.totalRewardPool();
    console.log(`質押合約總獎勵池: ${ethers.formatEther(totalRewards)}`);
  } catch (error) {
    console.log("⚠️ 無法讀取總獎勵池:", error.message);
  }

  console.log("\n✅ 設置完成！現在用戶可以質押並獲得獎勵了！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
