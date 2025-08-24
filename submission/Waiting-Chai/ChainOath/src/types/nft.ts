// NFT相关的TypeScript接口定义

// 成就类型常量 (与合约保持一致)
export const AchievementType = {
  FIRST_OATH: 0,      // 首次誓约
  OATH_KEEPER: 1,     // 守约达人
  TRUSTED_CREATOR: 2, // 信任创建者
  COMMUNITY_STAR: 3,  // 社区之星
  MILESTONE_MASTER: 4,// 里程碑大师
  EARLY_ADOPTER: 5    // 早期采用者
} as const;

export type AchievementType = typeof AchievementType[keyof typeof AchievementType];

// 成就信息接口
export interface AchievementInfo {
  achievementType: AchievementType;
  name: string;
  description: string;
  imageUrl: string;
  threshold: number; // 达成阈值
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// 用户成就NFT接口
export interface UserAchievementNFT {
  tokenId: number;
  achievementType: AchievementType;
  mintedAt: number; // 铸造时间戳
  owner: string; // 拥有者地址
  metadata?: NFTMetadata;
}

// NFT元数据接口
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
}

// NFT属性接口
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

// 铸造成就NFT的参数接口
export interface MintAchievementParams {
  achievementType: AchievementType;
  to: string; // 接收者地址
}

// 成就检查结果接口
export interface AchievementCheckResult {
  achievementType: AchievementType;
  isEligible: boolean; // 是否符合条件
  isOwned: boolean; // 是否已拥有
  currentProgress: number; // 当前进度
  threshold: number; // 需要达到的阈值
  canMint: boolean; // 是否可以铸造
}

// 用户成就统计接口
export interface UserAchievementStats {
  totalAchievements: number; // 总成就数
  ownedAchievements: AchievementType[]; // 已拥有的成就类型
  eligibleAchievements: AchievementType[]; // 符合条件但未铸造的成就
  progress: Record<AchievementType, number>; // 各成就的进度
}

// 成就图片映射
export const ACHIEVEMENT_IMAGES: Record<AchievementType, string> = {
  [AchievementType.FIRST_OATH]: '/src/assets/nft-images/first-oath.svg',
  [AchievementType.OATH_KEEPER]: '/src/assets/nft-images/oath-keeper.svg',
  [AchievementType.TRUSTED_CREATOR]: '/src/assets/nft-images/trusted-creater.svg',
  [AchievementType.COMMUNITY_STAR]: '/src/assets/nft-images/community-star.svg',
  [AchievementType.MILESTONE_MASTER]: '/src/assets/nft-images/milestone-master.svg',
  [AchievementType.EARLY_ADOPTER]: '/src/assets/nft-images/early-adopter.svg'
};

// 成就信息配置
export const ACHIEVEMENT_CONFIG: Record<AchievementType, AchievementInfo> = {
  [AchievementType.FIRST_OATH]: {
    achievementType: AchievementType.FIRST_OATH,
    name: '首次誓约',
    description: '创建或承诺了第一个誓约',
    imageUrl: ACHIEVEMENT_IMAGES[AchievementType.FIRST_OATH],
    threshold: 1,
    rarity: 'common'
  },
  [AchievementType.OATH_KEEPER]: {
    achievementType: AchievementType.OATH_KEEPER,
    name: '守约达人',
    description: '成功完成5个誓约',
    imageUrl: ACHIEVEMENT_IMAGES[AchievementType.OATH_KEEPER],
    threshold: 5,
    rarity: 'rare'
  },
  [AchievementType.TRUSTED_CREATOR]: {
    achievementType: AchievementType.TRUSTED_CREATOR,
    name: '信任创建者',
    description: '创建的誓约获得50个点赞',
    imageUrl: ACHIEVEMENT_IMAGES[AchievementType.TRUSTED_CREATOR],
    threshold: 50,
    rarity: 'epic'
  },
  [AchievementType.COMMUNITY_STAR]: {
    achievementType: AchievementType.COMMUNITY_STAR,
    name: '社区之星',
    description: '在平台上获得100个点赞',
    imageUrl: ACHIEVEMENT_IMAGES[AchievementType.COMMUNITY_STAR],
    threshold: 100,
    rarity: 'epic'
  },
  [AchievementType.MILESTONE_MASTER]: {
    achievementType: AchievementType.MILESTONE_MASTER,
    name: '里程碑大师',
    description: '创建10个誓约',
    imageUrl: ACHIEVEMENT_IMAGES[AchievementType.MILESTONE_MASTER],
    threshold: 10,
    rarity: 'rare'
  },
  [AchievementType.EARLY_ADOPTER]: {
    achievementType: AchievementType.EARLY_ADOPTER,
    name: '早期采用者',
    description: '平台早期用户',
    imageUrl: ACHIEVEMENT_IMAGES[AchievementType.EARLY_ADOPTER],
    threshold: 1,
    rarity: 'legendary'
  }
};

// NFT合约事件接口
export interface NFTEvent {
  event: string;
  args: Record<string, any>;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

// 成就铸造事件
export interface AchievementMintedEvent extends NFTEvent {
  event: 'AchievementMinted';
  args: {
    to: string;
    tokenId: number;
    achievementType: AchievementType;
  };
}

// 成就转移事件
export interface AchievementTransferEvent extends NFTEvent {
  event: 'Transfer';
  args: {
    from: string;
    to: string;
    tokenId: number;
  };
}

// 联合NFT事件类型
export type ChainOathNFTEvent = 
  | AchievementMintedEvent 
  | AchievementTransferEvent;