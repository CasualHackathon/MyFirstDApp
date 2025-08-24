import 'dotenv/config';
import hre from "hardhat";
import fs from 'fs';

async function main() {
  console.log("檢查合約當前狀態...");

  // 取得 deployer wallet
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

  const tokenA = TestToken.attach(contractAddresses.tokenA);
  const rewardToken = TestToken.attach(contractAddresses.rewardToken);
  const staking = SimpleStaking.attach(contractAddresses.staking);

  // 檢查餘額
  const tokenABalance = await tokenA.balanceOf(deployer.address);
  const rewardTokenBalance = await rewardToken.balanceOf(deployer.address);
  const stakingRewardBalance = await rewardToken.balanceOf(await staking.getAddress());

  console.log("\n當前狀態:");
  console.log("部署錢包 Token A 餘額:", hre.ethers.formatEther(tokenABalance));
  console.log("部署錢包獎勵代幣餘額:", hre.ethers.formatEther(rewardTokenBalance));
  console.log("質押合約獎勵代幣餘額:", hre.ethers.formatEther(stakingRewardBalance));

  // 檢查質押合約狀態
  const stakingInfo = await staking.getContractInfo();
  console.log("\n質押合約狀態:");
  console.log("總質押量:", hre.ethers.formatEther(stakingInfo[0]));
  console.log("總獎勵池:", hre.ethers.formatEther(stakingInfo[1]));
  console.log("獎勵率:", stakingInfo[2].toString());

  // 如果需要添加更多獎勵
  if (stakingInfo[1] < hre.ethers.parseEther("200000")) {
    console.log("\n質押合約獎勵不足，開始添加獎勵...");
    
    const addRewardAmount = hre.ethers.parseEther("300000");
    
    // 先檢查是否有足夠的獎勵代幣
    if (rewardTokenBalance < addRewardAmount) {
      console.log("獎勵代幣不足，先 mint 獎勵代幣...");
      const mintTx = await rewardToken.connect(deployer).mint(deployer.address, addRewardAmount);
      await mintTx.wait();
      console.log("✅ 已 mint 獎勵代幣");
    }

    // 授權並添加獎勵
    const approveTx = await rewardToken.connect(deployer).approve(await staking.getAddress(), addRewardAmount);
    await approveTx.wait();
    
    const addRewardTx = await staking.connect(deployer).addRewards(addRewardAmount);
    await addRewardTx.wait();
    
    console.log("✅ 已添加 300,000 獎勵代幣到質押合約");
  }

  // 如果需要 mint 更多 Token A
  if (tokenABalance < hre.ethers.parseEther("500000")) {
    console.log("\nToken A 不足，開始 mint Token A...");
    const mintAmount = hre.ethers.parseEther("1000000");
    const mintTx = await tokenA.connect(deployer).mint(deployer.address, mintAmount);
    await mintTx.wait();
    console.log("✅ 已 mint 1,000,000 Token A");
  }

  console.log("\n最終狀態檢查完成！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
