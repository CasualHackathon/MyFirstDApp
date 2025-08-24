import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying NFT Marketplace...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy the marketplace contract
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.connect(deployer).deploy();
  
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  
  console.log("NFT Marketplace deployed to:", marketplaceAddress);

  // Read existing contract addresses
  const contractsPath = path.join(__dirname, '..', 'lib', 'contracts.ts');
  let contractsContent = fs.readFileSync(contractsPath, 'utf8');
  
  // Update with new marketplace address
  const newMarketplaceEntry = `  NFTMarketplace: '${marketplaceAddress}' as const,`;
  
  // Find the position to insert the new entry
  const insertPosition = contractsContent.indexOf('} as const;');
  if (insertPosition !== -1) {
    contractsContent = contractsContent.slice(0, insertPosition) + 
                     newMarketplaceEntry + '\n' + 
                     contractsContent.slice(insertPosition);
  }
  
  fs.writeFileSync(contractsPath, contractsContent);
  console.log("Updated contracts.ts with marketplace address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
