// Contract addresses for Sepolia testnet
export const CONTRACT_ADDRESSES = {
  TestToken: '0xc4417D80F2D8ca9FF51Df6277663E35Ab6E3bAff',
  TokenB: '0xea58D8C226e5b9Dc3EcEA8fC1AAD4fE4dc02ff68',
  RewardToken: '0x1d54edb6f8975777cF7a9932c58D8e7d4d93F986',
  SimpleSwap: '0x3806f5f10781fA47154De39E363791036c6cCf14',
  SimpleStaking: '0x9C3A90611f2a4413F95ef70E43b8DbC06EEd1329',
  SimpleLiquidityPool: '0x64249720379Df33fE1195910EBade02D133899B3',
  MyFirstNFT: '0x2E9F25EC99f6A6ad7F07aDD221Ae3065FE2665c3', // NFT contract deployed on Sepolia
  NFTMarketplace: '0x4FaFbfD317aBA6248A48D2df0e0aF20C6b2Ee150' as const,
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia
  name: 'Sepolia',
  rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/PGrtGwcAYDbXyA05A6K93YdMneRYdebL',
  blockExplorer: 'https://sepolia.etherscan.io',
} as const;

export type ContractName = keyof typeof CONTRACT_ADDRESSES;
