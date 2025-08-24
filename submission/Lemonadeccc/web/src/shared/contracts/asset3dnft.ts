// Asset3DNFT Contract ABI and Address Configuration
import type { Abi } from 'viem';

export const ASSET3D_NFT_ABI = [
  // Constructor
  {
    "type": "constructor",
    "inputs": [
      {"name": "name_", "type": "string", "internalType": "string"},
      {"name": "symbol_", "type": "string", "internalType": "string"},
      {"name": "baseUri_", "type": "string", "internalType": "string"},
      {"name": "defaultAdmin", "type": "address", "internalType": "address"}
    ],
    "stateMutability": "nonpayable"
  },
  
  // Events
  {
    "type": "event",
    "name": "Asset3DMinted",
    "inputs": [
      {"name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "creator", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "meshyTaskId", "type": "string", "indexed": false, "internalType": "string"},
      {"name": "mode", "type": "uint8", "indexed": false, "internalType": "uint8"}
    ],
    "anonymous": false
  },
  
  // Read Functions
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "owner", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  
  // Asset Metadata Functions
  {
    "type": "function",
    "name": "getAssetMetadata",
    "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {
        "name": "metadata",
        "type": "tuple",
        "internalType": "struct IAsset3DNFT.Asset3DMetadata",
        "components": [
          {"name": "name", "type": "string", "internalType": "string"},
          {"name": "description", "type": "string", "internalType": "string"},
          {"name": "meshyTaskId", "type": "string", "internalType": "string"},
          {"name": "modelUrl", "type": "string", "internalType": "string"},
          {"name": "thumbnailUrl", "type": "string", "internalType": "string"},
          {"name": "videoUrl", "type": "string", "internalType": "string"},
          {"name": "textureUrls", "type": "string[]", "internalType": "string[]"},
          {"name": "artStyle", "type": "string", "internalType": "string"},
          {"name": "mode", "type": "uint8", "internalType": "uint8"},
          {"name": "hasTexture", "type": "bool", "internalType": "bool"},
          {"name": "polycount", "type": "uint256", "internalType": "uint256"},
          {"name": "creator", "type": "address", "internalType": "address"},
          {"name": "royaltyBps", "type": "uint96", "internalType": "uint96"},
          {"name": "createdAt", "type": "uint256", "internalType": "uint256"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAssetsByCreator",
    "inputs": [{"name": "creator", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "tokenIds", "type": "uint256[]", "internalType": "uint256[]"}],
    "stateMutability": "view"
  },
  
  // Write Functions  
  {
    "type": "function",
    "name": "mint",
    "inputs": [
      {"name": "to", "type": "address", "internalType": "address"},
      {
        "name": "metadata",
        "type": "tuple",
        "internalType": "struct IAsset3DNFT.Asset3DMetadata",
        "components": [
          {"name": "name", "type": "string", "internalType": "string"},
          {"name": "description", "type": "string", "internalType": "string"},
          {"name": "meshyTaskId", "type": "string", "internalType": "string"},
          {"name": "modelUrl", "type": "string", "internalType": "string"},
          {"name": "thumbnailUrl", "type": "string", "internalType": "string"},
          {"name": "videoUrl", "type": "string", "internalType": "string"},
          {"name": "textureUrls", "type": "string[]", "internalType": "string[]"},
          {"name": "artStyle", "type": "string", "internalType": "string"},
          {"name": "mode", "type": "uint8", "internalType": "uint8"},
          {"name": "hasTexture", "type": "bool", "internalType": "bool"},
          {"name": "polycount", "type": "uint256", "internalType": "uint256"},
          {"name": "creator", "type": "address", "internalType": "address"},
          {"name": "royaltyBps", "type": "uint96", "internalType": "uint96"},
          {"name": "createdAt", "type": "uint256", "internalType": "uint256"}
        ]
      }
    ],
    "outputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "nonpayable"
  },
  
  // Role Management
  {
    "type": "function",
    "name": "hasRole",
    "inputs": [
      {"name": "role", "type": "bytes32", "internalType": "bytes32"},
      {"name": "account", "type": "address", "internalType": "address"}
    ],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  
  // Role Constants
  {
    "type": "function",
    "name": "MINTER_ROLE",
    "inputs": [],
    "outputs": [{"name": "", "type": "bytes32", "internalType": "bytes32"}],
    "stateMutability": "view"
  }
] as const satisfies Abi;

// Contract Addresses
export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet
  11155111: {
    ASSET3D_NFT: '0xdbC43636FC0E13cDEc7B195c90B2E4070BbDDACa', // Deployed 2025-08-17
  },
  // Hardhat Local
  31337: {
    ASSET3D_NFT: '0x0000000000000000000000000000000000000000', // To be updated
  },
} as const;

// Type definitions
export interface Asset3DMetadata {
  name: string;
  description: string;
  meshyTaskId: string;
  modelUrl: string;
  thumbnailUrl: string;
  videoUrl: string;
  textureUrls: readonly string[];
  artStyle: string;
  mode: number;
  hasTexture: boolean;
  polycount: bigint;
  creator: `0x${string}`;
  royaltyBps: bigint;
  createdAt: bigint;
}
