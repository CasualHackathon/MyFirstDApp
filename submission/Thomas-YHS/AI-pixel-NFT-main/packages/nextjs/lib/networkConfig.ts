import { Chain } from "viem";
import { hardhat, sepolia, mainnet } from "viem/chains";

export interface NetworkConfig {
  chain: Chain;
  rpcUrl: string;
  contractAddress: string;
}

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  // 本地开发网络
  local: {
    chain: hardhat,
    rpcUrl: "http://127.0.0.1:8545",
    contractAddress: "0xa4C1118cF44bC08bbEa969eE13718E5348f04e37",
  },
  
  // Sepolia测试网
  sepolia: {
    chain: sepolia,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.infura.io/v3/86f884eff86f417d8b01a296c5dc0c3e",
    contractAddress: "0xa4C1118cF44bC08bbEa969eE13718E5348f04e37",
  },
  
  // 主网（预留）
  mainnet: {
    chain: mainnet,
    rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
    contractAddress: "0x0000000000000000000000000000000000000000", // 主网地址待部署
  },
};

/**
 * 获取当前环境的网络配置
 * 优先级：环境变量 > 默认配置
 */
export function getCurrentNetworkConfig(): NetworkConfig {
  // 从环境变量获取网络配置
  const networkName = process.env.NEXT_PUBLIC_NETWORK || process.env.NODE_ENV === 'development' ? 'sepolia' : 'sepolia';
  
  const config = NETWORK_CONFIGS[networkName];
  if (!config) {
    console.warn(`Network config for "${networkName}" not found, falling back to sepolia`);
    return NETWORK_CONFIGS.sepolia;
  }
  
  return config;
}

/**
 * WeatherNFT合约的简化ABI
 */
export const WEATHER_NFT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "string", "name": "city", "type": "string" },
      { "internalType": "string", "name": "date", "type": "string" }
    ],
    "name": "hasAlreadyMinted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "city", "type": "string" },
      { "internalType": "string", "name": "date", "type": "string" },
      { "internalType": "int256", "name": "temperature", "type": "int256" },
      { "internalType": "string", "name": "weather", "type": "string" },
      { "internalType": "string", "name": "timeOfDay", "type": "string" },
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "mintWithURI",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;