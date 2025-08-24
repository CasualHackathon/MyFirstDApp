// 导入需要在运行时使用的类型和常量
import { 
  AchievementType,
  ACHIEVEMENT_IMAGES,
  ACHIEVEMENT_CONFIG
} from './nft';
import type {
  AchievementInfo,
  UserAchievementNFT,
  NFTMetadata,
  NFTAttribute,
  MintAchievementParams,
  AchievementCheckResult,
  UserAchievementStats
} from './nft';

// 重新导出NFT相关的成就类型定义
export { 
  AchievementType,
  ACHIEVEMENT_IMAGES,
  ACHIEVEMENT_CONFIG
};
export type {
  AchievementInfo,
  UserAchievementNFT,
  NFTMetadata,
  NFTAttribute,
  MintAchievementParams,
  AchievementCheckResult,
  UserAchievementStats
};

// 兼容旧版本的Achievement接口（用于前端展示）
export interface Achievement {
  id: number;
  achievementType: AchievementType;
  name: string;
  description: string;
  isObtained: boolean;
  obtainedAt?: number;
  tokenId?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  requirement?: number;
  imageUrl?: string;
}

// 成就展示数据转换函数
export function convertToAchievementDisplay(
  achievementType: AchievementType,
  userNFT?: UserAchievementNFT
): Achievement {
  const config = ACHIEVEMENT_CONFIG[achievementType];
  
  return {
    id: achievementType,
    achievementType,
    name: config.name,
    description: config.description,
    isObtained: !!userNFT,
    obtainedAt: userNFT?.mintedAt,
    tokenId: userNFT?.tokenId,
    rarity: config.rarity,
    requirement: config.threshold,
    imageUrl: config.imageUrl
  };
}