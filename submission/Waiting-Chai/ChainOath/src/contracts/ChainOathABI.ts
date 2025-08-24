// ChainOathSecure 智能合约 ABI（重构版本）
export const ChainOathSecureABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setNFTContract",
    "inputs": [
      { "name": "_nftContract", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createOath",
    "inputs": [
      { "name": "_title", "type": "string" },
      { "name": "_description", "type": "string" },
      { "name": "_committer", "type": "address" },
      { "name": "_tokenAddress", "type": "address" },
      { "name": "_amount", "type": "uint256" },
      { "name": "_deadline", "type": "uint256" },
      { "name": "_checkpoints", "type": "string[]" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "evaluateCompletion",
    "inputs": [
      { "name": "_oathId", "type": "uint256" },
      { "name": "_isCompleted", "type": "bool" },
      { "name": "_feedback", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "handleExpiredOath",
    "inputs": [
      { "name": "_oathId", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "likeOath",
    "inputs": [
      { "name": "_oathId", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addComment",
    "inputs": [
      { "name": "_oathId", "type": "uint256" },
      { "name": "_content", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getOath",
    "inputs": [{ "name": "_oathId", "type": "uint256" }],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "title", "type": "string" },
          { "name": "description", "type": "string" },
          { "name": "creater", "type": "address" },
          { "name": "committer", "type": "address" },
          { "name": "amount", "type": "uint256" },
          { "name": "deadline", "type": "uint256" },
          { "name": "createdAt", "type": "uint256" },
          { "name": "status", "type": "uint8" },
          { "name": "upvotes", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserCreatedOaths",
    "inputs": [{ "name": "_user", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserCommittedOaths",
    "inputs": [{ "name": "_user", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getOathComments",
    "inputs": [{ "name": "_oathId", "type": "uint256" }],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "oathId", "type": "uint256" },
          { "name": "author", "type": "address" },
          { "name": "content", "type": "string" },
          { "name": "timestamp", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasUserLiked",
    "inputs": [
      { "name": "_oathId", "type": "uint256" },
      { "name": "_user", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserStats",
    "inputs": [{ "name": "_user", "type": "address" }],
    "outputs": [
      { "name": "createdCount", "type": "uint256" },
      { "name": "completedCount", "type": "uint256" },
      { "name": "totalLikes", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getOathCheckpoints",
    "inputs": [{ "name": "_oathId", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "string[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "updateCheckpoint",
    "inputs": [
      { "name": "_oathId", "type": "uint256" },
      { "name": "_checkpointIndex", "type": "uint256" },
      { "name": "_newContent", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAllOaths",
    "inputs": [
      { "name": "_offset", "type": "uint256" },
      { "name": "_limit", "type": "uint256" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "title", "type": "string" },
          { "name": "description", "type": "string" },
          { "name": "creater", "type": "address" },
          { "name": "committer", "type": "address" },
          { "name": "amount", "type": "uint256" },
          { "name": "deadline", "type": "uint256" },
          { "name": "createdAt", "type": "uint256" },
          { "name": "status", "type": "uint8" },
          { "name": "upvotes", "type": "uint256" }
        ]
      },
      { "name": "total", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "emergencyPause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "emergencyUnpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "emergencyWithdraw",
    "inputs": [
      { "name": "_token", "type": "address" },
      { "name": "_amount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "oathCounter",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "token",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "nftContract",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "OathCreated",
    "inputs": [
      { "name": "oathId", "type": "uint256", "indexed": true },
      { "name": "creater", "type": "address", "indexed": true },
      { "name": "committer", "type": "address", "indexed": true },
      { "name": "title", "type": "string", "indexed": false },
      { "name": "amount", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "OathEvaluated",
    "inputs": [
      { "name": "oathId", "type": "uint256", "indexed": true },
      { "name": "isCompleted", "type": "bool", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "OathLiked",
    "inputs": [
      { "name": "oathId", "type": "uint256", "indexed": true },
      { "name": "user", "type": "address", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "CommentAdded",
    "inputs": [
      { "name": "oathId", "type": "uint256", "indexed": true },
      { "name": "commentId", "type": "uint256", "indexed": true },
      { "name": "author", "type": "address", "indexed": true },
      { "name": "content", "type": "string", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "FundsReleased",
    "inputs": [
      { "name": "oathId", "type": "uint256", "indexed": true },
      { "name": "recipient", "type": "address", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "NFTContractSet",
    "inputs": [
      { "name": "nftContract", "type": "address", "indexed": true }
    ]
  }
] as const;

// ChainOathNFT 成就合约 ABI
export const ChainOathNFTABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
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
      { "name": "_baseURI", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateAchievementThreshold",
    "inputs": [
      { "name": "_achievementType", "type": "uint8" },
      { "name": "_threshold", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "checkAndMintAchievements",
    "inputs": [
      { "name": "_user", "type": "address" }
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
      { "name": "user", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getUserTokens",
    "inputs": [
      { "name": "_user", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasAchievement",
    "inputs": [
      { "name": "_user", "type": "address" },
      { "name": "_achievementType", "type": "uint8" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAchievementInfo",
    "inputs": [
      { "name": "_achievementType", "type": "uint8" }
    ],
    "outputs": [
      { "name": "name", "type": "string" },
      { "name": "description", "type": "string" },
      { "name": "threshold", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "batchCheckAchievements",
    "inputs": [
      { "name": "_user", "type": "address" },
      { "name": "_achievementTypes", "type": "uint8[]" }
    ],
    "outputs": [{ "name": "", "type": "bool[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      { "name": "owner", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "oathContract",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenCounter",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "AchievementUnlocked",
    "inputs": [
      { "name": "user", "type": "address", "indexed": true },
      { "name": "achievementType", "type": "uint8", "indexed": true },
      { "name": "tokenId", "type": "uint256", "indexed": true }
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

// ERC20 代币 ABI（简化版）
export const ERC20ABI = [
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      { "name": "from", "type": "address", "indexed": true },
      { "name": "to", "type": "address", "indexed": true },
      { "name": "value", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      { "name": "owner", "type": "address", "indexed": true },
      { "name": "spender", "type": "address", "indexed": true },
      { "name": "value", "type": "uint256", "indexed": false }
    ]
  }
] as const;

// WETH (Wrapped Ether) ABI
export const WETHABI = [
  {
    "type": "function",
    "name": "deposit",
    "inputs": [],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawAll",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getETHBalance",
    "inputs": [
      { "name": "account", "type": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "Deposit",
    "inputs": [
      { "name": "account", "type": "address", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "Withdrawal",
    "inputs": [
      { "name": "account", "type": "address", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false }
    ]
  }
] as const;