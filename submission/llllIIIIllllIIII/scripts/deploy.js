
import 'dotenv/config';
import hre from "hardhat";
import fs from 'fs';

async function main() {
  console.log("開始部署 DeFi 合約...");

  // 取得 deployer wallet
  const provider = new hre.ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length !== 64) {
    throw new Error('Invalid PRIVATE_KEY in .env，請確認為 64 字元純 hex 並無 0x 前綴');
  }
  const deployer = new hre.ethers.Wallet(privateKey, provider);
  
  // 檢查錢包資訊
  console.log("錢包地址:", deployer.address);
  const balance = await provider.getBalance(deployer.address);
  console.log("錢包餘額:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error('錢包餘額不足，請先領取 Sepolia 測試網 ETH');
  }

  // 部署測試代幣
  console.log("\n1. 部署測試代幣...");
  const TestToken = await hre.ethers.getContractFactory("TestToken", deployer);

  // 部署 TokenA (TestUSDC)
  const tokenA = await TestToken.deploy(
    "Test USDC",
    "TUSDC",
    1000000 // 1M initial supply
  );
  await tokenA.waitForDeployment();
  console.log("TokenA (TUSDC) deployed to:", await tokenA.getAddress());

  // 部署 TokenB (TestUSDT)
  const tokenB = await TestToken.deploy(
    "Test USDT",
    "TUSDT",
    1000000 // 1M initial supply
  );
  await tokenB.waitForDeployment();
  console.log("TokenB (TUSDT) deployed to:", await tokenB.getAddress());

  // 部署獎勵代幣
  const rewardToken = await TestToken.deploy(
    "Reward Token",
    "REWARD",
    10000000 // 10M initial supply for rewards
  );
  await rewardToken.waitForDeployment();
  console.log("Reward Token deployed to:", await rewardToken.getAddress());

  // 部署 Swap 合約
  console.log("\n2. 部署 Swap 合約...");
  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap", deployer);
  const swap = await SimpleSwap.deploy(
    await tokenA.getAddress(),
    await tokenB.getAddress()
  );
  await swap.waitForDeployment();
  console.log("SimpleSwap deployed to:", await swap.getAddress());

  // 部署 Staking 合約
  console.log("\n3. 部署 Staking 合約...");
  const SimpleStaking = await hre.ethers.getContractFactory("SimpleStaking", deployer);
  const staking = await SimpleStaking.deploy(
    await tokenA.getAddress(), // 質押 TokenA
    await rewardToken.getAddress() // 獎勵是 RewardToken
  );
  await staking.waitForDeployment();
  console.log("SimpleStaking deployed to:", await staking.getAddress());

  // 部署 LP 合約
  console.log("\n4. 部署 LP 合約...");
  const SimpleLiquidityPool = await hre.ethers.getContractFactory("SimpleLiquidityPool", deployer);
  const liquidityPool = await SimpleLiquidityPool.deploy(
    await tokenA.getAddress(),
    await tokenB.getAddress(),
    "TUSDC-TUSDT LP",
    "TUSDC-TUSDT"
  );
  await liquidityPool.waitForDeployment();
  console.log("SimpleLiquidityPool deployed to:", await liquidityPool.getAddress());

  // 初始化合約（添加初始流動性等）
  console.log("\n5. 初始化合約...");

  // 為 Swap 合約添加初始流動性
  const initialLiquidityA = hre.ethers.parseEther("10000"); // 10,000 TUSDC
  const initialLiquidityB = hre.ethers.parseEther("10000"); // 10,000 TUSDT

  await tokenA.connect(deployer).approve(await swap.getAddress(), initialLiquidityA);
  await tokenB.connect(deployer).approve(await swap.getAddress(), initialLiquidityA);
  await swap.connect(deployer).addLiquidity(initialLiquidityA, initialLiquidityB);
  console.log("Swap 初始流動性已添加");

  // 為 Staking 合約添加獎勵代幣
  const rewardAmount = hre.ethers.parseEther("100000"); // 100,000 REWARD
  await rewardToken.connect(deployer).approve(await staking.getAddress(), rewardAmount);
  await staking.connect(deployer).addRewards(rewardAmount);
  console.log("Staking 獎勵代幣已添加");

  // 部署 NFT 合約
  console.log("\n5. 部署 NFT 合約...");
  const MyFirstNFT = await hre.ethers.getContractFactory("MyFirstNFT", deployer);
  const nft = await MyFirstNFT.deploy();
  await nft.waitForDeployment();
  console.log("NFT 合約部署成功 at:", await nft.getAddress());

  // 輸出合約地址供前端使用
  console.log("\n🎉 部署完成！合約地址：");
  console.log("=====================================");
  console.log("TokenA (TUSDC):", await tokenA.getAddress());
  console.log("TokenB (TUSDT):", await tokenB.getAddress());
  console.log("RewardToken:", await rewardToken.getAddress());
  console.log("SimpleSwap:", await swap.getAddress());
  console.log("SimpleStaking:", await staking.getAddress());
  console.log("SimpleLiquidityPool:", await liquidityPool.getAddress());
  console.log("MyFirstNFT:", await nft.getAddress());
  console.log("=====================================");

  // 生成前端配置文件
  const contractAddresses = {
    tokenA: await tokenA.getAddress(),
    tokenB: await tokenB.getAddress(),
    rewardToken: await rewardToken.getAddress(),
    swap: await swap.getAddress(),
    staking: await staking.getAddress(),
    liquidityPool: await liquidityPool.getAddress(),
    nft: await nft.getAddress(),
    network: hre.network.name
  };

  fs.writeFileSync(
    './contractAddresses.json',
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("合約地址已保存到 contractAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
