import 'dotenv/config';
import hre from "hardhat";
import fs from 'fs';

async function main() {
  console.log("開始部署 NFT 合約...");

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

  // 部署 NFT 合約
  console.log("\n部署 MyFirstNFT 合約...");
  const MyFirstNFT = await hre.ethers.getContractFactory("MyFirstNFT", deployer);
  const nft = await MyFirstNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("NFT 合約部署成功 at:", nftAddress);

  // 讀取現有的合約地址文件（如果存在）
  let contractAddresses = {};
  const addressFile = './contractAddresses.json';
  if (fs.existsSync(addressFile)) {
    contractAddresses = JSON.parse(fs.readFileSync(addressFile, 'utf8'));
    console.log("讀取現有合約地址...");
  }

  // 更新 NFT 合約地址
  contractAddresses.nft = nftAddress;
  contractAddresses.MyFirstNFT = nftAddress;  // 也加上這個 key 以防萬一
  contractAddresses.network = hre.network.name;
  contractAddresses.lastUpdated = new Date().toISOString();

  // 保存更新後的合約地址
  fs.writeFileSync(addressFile, JSON.stringify(contractAddresses, null, 2));
  console.log("合約地址已更新到", addressFile);

  // 輸出重要資訊
  console.log("\n🎉 NFT 合約部署完成！");
  console.log("=====================================");
  console.log("MyFirstNFT 合約地址:", nftAddress);
  console.log("網路:", hre.network.name);
  console.log("部署者:", deployer.address);
  console.log("=====================================");
  console.log("\n請更新前端配置文件中的 NFT 合約地址");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
