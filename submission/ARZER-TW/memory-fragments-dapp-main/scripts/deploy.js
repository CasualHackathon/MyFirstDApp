const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("開始部署 MemoryFragments 合約...");
  
  const MemoryFragments = await hre.ethers.getContractFactory("MemoryFragments");
  
  console.log("正在部署合約...");
  const memoryFragments = await MemoryFragments.deploy();
  
  await memoryFragments.waitForDeployment();
  
  const contractAddress = await memoryFragments.getAddress();
  console.log("✅ MemoryFragments 合約已部署到:", contractAddress);
  
  // 保存合約地址和ABI
  const contractsDir = "./frontend/src/contracts";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  // 保存合約地址
  fs.writeFileSync(
    `${contractsDir}/contract-address.json`,
    JSON.stringify({ MemoryFragments: contractAddress }, undefined, 2)
  );
  
  // 保存合約ABI
  const MemoryFragmentsArtifact = await hre.artifacts.readArtifact("MemoryFragments");
  fs.writeFileSync(
    `${contractsDir}/MemoryFragments.json`,
    JSON.stringify(MemoryFragmentsArtifact, null, 2)
  );
  
  console.log("✅ 合約地址和ABI已保存到前端目錄");
  
  // 網絡驗證
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("等待區塊確認後驗證合約...");
    await memoryFragments.deployedTransaction?.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ 合約已在區塊鏈瀏覽器上驗證");
    } catch (error) {
      console.log("❌ 合約驗證失敗:", error.message);
    }
  }
  
  console.log("\n🎉 部署完成！");
  console.log(`📋 網絡: ${hre.network.name}`);
  console.log(`📋 合約地址: ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失敗:", error);
    process.exit(1);
  });
