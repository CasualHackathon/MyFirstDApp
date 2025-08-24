export const ChainOathNFTABI = [
  // 构造函数
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  
  // 设置函数
  {
    "type": "function",
    "name": "setOathContract",
    "inputs": [
      { "name": "_oathContract", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setBaseURI",
    "inputs": [
      { "name": "baseURI", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateAchievementThreshold",
    "inputs": [
      { "name": "achievementType", "type": "uint8" },
      { "name": "threshold", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  
  // 成就检查和铸造函数
  {
    "type": "function",
    "name": "checkAndMintAchievements",
    "inputs": [
      { "name": "user", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "checkMyAchievements",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "recordUserLike",
    "inputs": [
      { "name": "user", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  
  // 查询函数
  {
    "type": "function",
    "name": "getUserTokens",
    "inputs": [
      { "name": "user", "type": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasAchievement",
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "achievementType", "type": "uint8" }
    ],
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAchievement",
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          { "name": "achievementType", "type": "uint8" },
          { "name": "name", "type": "string" },
          { "name": "description", "type": "string" },
          { "name": "imageURI", "type": "string" },
          { "name": "mintTime", "type": "uint256" },
          { "name": "isActive", "type": "bool" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserAchievementStats",
    "inputs": [
      { "name": "user", "type": "address" }
    ],
    "outputs": [
      { "name": "totalAchievements", "type": "uint256" },
      { "name": "achievementStatus", "type": "bool[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "achievementThresholds",
    "inputs": [
      { "name": "", "type": "uint8" }
    ],
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  
  // 状态变量查询
  {
    "type": "function",
    "name": "tokenCounter",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "oathContract",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "deployTime",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  
  // ERC721 标准函数
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      { "name": "owner", "type": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [
      { "name": "", "type": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [
      { "name": "", "type": "string" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getApproved",
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [
      { "name": "", "type": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setApprovalForAll",
    "inputs": [
      { "name": "operator", "type": "address" },
      { "name": "approved", "type": "bool" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "isApprovedForAll",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "operator", "type": "address" }
    ],
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" },
      { "name": "data", "type": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  
  // 事件
  {
    "type": "event",
    "name": "AchievementMinted",
    "inputs": [
      { "name": "user", "type": "address", "indexed": true },
      { "name": "achievementType", "type": "uint8", "indexed": true },
      { "name": "tokenId", "type": "uint256", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "OathContractSet",
    "inputs": [
      { "name": "oathContract", "type": "address", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "BaseURIUpdated",
    "inputs": [
      { "name": "newBaseURI", "type": "string", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      { "name": "from", "type": "address", "indexed": true },
      { "name": "to", "type": "address", "indexed": true },
      { "name": "tokenId", "type": "uint256", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      { "name": "owner", "type": "address", "indexed": true },
      { "name": "approved", "type": "address", "indexed": true },
      { "name": "tokenId", "type": "uint256", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "ApprovalForAll",
    "inputs": [
      { "name": "owner", "type": "address", "indexed": true },
      { "name": "operator", "type": "address", "indexed": true },
      { "name": "approved", "type": "bool", "indexed": false }
    ]
  }
] as const;