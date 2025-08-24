// 智能合约配置
export const CONTRACT_CONFIG = {
  // 主网配置
  mainnet: {
    chainId: 1,
    chainName: 'Ethereum Mainnet',
    chainOathAddress: import.meta.env.VITE_MAINNET_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    chainOathNFTAddress: import.meta.env.VITE_MAINNET_NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    blockExplorer: 'https://etherscan.io'
  },
  // Sepolia 测试网配置 (已部署)
  sepolia: {
    chainId: 11155111,
    chainName: 'Sepolia Testnet',
    chainOathAddress: import.meta.env.VITE_SEPOLIA_CONTRACT_ADDRESS || '0x03c78D9cAB691B6E3c229e7c9cF685fE2189a124',
    chainOathNFTAddress: import.meta.env.VITE_SEPOLIA_NFT_CONTRACT_ADDRESS || '0x28dBAf2A5f8B2a7ed1FF41DE066c7a1de9dFa7f6',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  // 本地开发网络
  localhost: {
    chainId: 31337,
    chainName: 'Localhost',
    chainOathAddress: import.meta.env.VITE_LOCALHOST_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    chainOathNFTAddress: import.meta.env.VITE_LOCALHOST_NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    blockExplorer: ''
  }
};

// 网络配置选项
export type NetworkType = 'mainnet' | 'sepolia' | 'localhost';

// 当前使用的网络配置（可通过环境变量或手动设置）
export const CURRENT_NETWORK: NetworkType = (
  import.meta.env.VITE_NETWORK as NetworkType
) || (
  import.meta.env.DEV ? 'localhost' : 'sepolia'
);

// 获取当前网络配置
export const getCurrentNetworkConfig = () => {
  const config = CONTRACT_CONFIG[CURRENT_NETWORK];
  if (!config) {
    throw new Error(`Unsupported network: ${CURRENT_NETWORK}`);
  }
  return config;
};

// 获取指定网络配置
export const getNetworkConfig = (network: NetworkType) => {
  const config = CONTRACT_CONFIG[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return config;
};

// 检查当前网络是否为测试网
export const isTestNetwork = () => {
  return CURRENT_NETWORK === 'sepolia' || CURRENT_NETWORK === 'localhost';
};

// 获取网络显示名称
export const getNetworkDisplayName = (network?: NetworkType) => {
  const targetNetwork = network || CURRENT_NETWORK;
  return CONTRACT_CONFIG[targetNetwork]?.chainName || 'Unknown Network';
};

// 代币配置
export const TOKEN_OPTIONS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000', // 零地址表示ETH
    decimals: 18,
    isNative: true
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0xdeE41a7bFA8b9d95050C0aEcFd91429f74063f90', // 自己部署的WETH
    decimals: 18,
    isNative: false
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    decimals: 6,
    isNative: false
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Sepolia USDT
    decimals: 6,
    isNative: false
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6', // Sepolia DAI
    decimals: 18,
    isNative: false
  }
];

// 常用的 ERC20 代币地址（Sepolia 测试网）
export const TEST_TOKENS = {
  sepolia: {
    WETH: '0xdeE41a7bFA8b9d95050C0aEcFd91429f74063f90', // 我们部署的WETH
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Sepolia USDT
    DAI: '0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6'   // Sepolia DAI
  },
  mainnet: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // 主网 WETH
    USDC: '0xA0b86a33E6441b8C4505B6B8C0C4C8C4C4C4C4C4', // 主网 USDC
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // 主网 USDT
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'   // 主网 DAI
  },
  localhost: {
    WETH: '0x0000000000000000000000000000000000000000', // 本地环境需要部署WETH合约
    USDC: '0x0000000000000000000000000000000000000000',
    USDT: '0x0000000000000000000000000000000000000000',
    DAI: '0x0000000000000000000000000000000000000000'
  }
};

// 获取当前网络的测试代币
export const getCurrentTestTokens = () => {
  return TEST_TOKENS[CURRENT_NETWORK as keyof typeof TEST_TOKENS] || TEST_TOKENS.sepolia;
};