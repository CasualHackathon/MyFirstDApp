import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';

const { chains, publicClient } = configureChains(
  [hardhat, sepolia, mainnet],
  [
    alchemyProvider({ apiKey: 'demo' }), // 使用 demo key，更穩定
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Memory Fragments DApp',
  projectId: 'c4f79cc821944d9680842e34466bfb', // 有效的測試 Project ID
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export { chains, wagmiConfig };

// 你的合約地址配置
export const CONTRACT_CONFIG = {
  addresses: {
    31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // 本地 Hardhat 網絡
    11155111: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Sepolia 測試網
    1: '0x0000000000000000000000000000000000000000', // 主網（暫時用零地址）
  }
};

// 導出合約 ABI（你的智能合約的接口）
export const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "uint256[]", "name": "_fragmentIds", "type": "uint256[]"},
      {"internalType": "string", "name": "_aiStoryHash", "type": "string"},
      {"internalType": "string", "name": "_title", "type": "string"},
      {"internalType": "uint256", "name": "_emotionalIntensity", "type": "uint256"}
    ],
    "name": "createStory",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_storyId", "type": "uint256"}],
    "name": "mintStoryNFT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];
