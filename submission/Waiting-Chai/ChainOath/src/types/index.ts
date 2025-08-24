// 统一的类型定义导出文件

// 合约相关类型
export * from './contract';

// NFT相关类型
export * from './nft';

// 成就相关类型（包含兼容性接口）
export * from './achievement';

// 常用的联合类型
export type { 
  Oath,
  Comment,
  UserStats,
  PlatformStats,
  CreateOathParams,
  EvaluateCompletionParams,
  AddCommentParams,
  PaginationParams,
  PaginatedResult,
  TransactionResult,
  Notification
} from './contract';

export { ChainOathError } from './contract';

export {
  AchievementType,
  ACHIEVEMENT_IMAGES,
  ACHIEVEMENT_CONFIG
} from './nft';

export type {
  AchievementInfo,
  UserAchievementNFT,
  NFTMetadata,
  MintAchievementParams,
  AchievementCheckResult,
  UserAchievementStats
} from './nft';

export type {
  Achievement
} from './achievement';