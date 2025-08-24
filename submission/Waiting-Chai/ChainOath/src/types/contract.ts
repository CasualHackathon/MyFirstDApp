// 合约相关的TypeScript接口定义

// 誓约状态常量
export const OathStatus = {
  PENDING: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  FAILED: 3,
  EXPIRED: 4
} as const;

export type OathStatus = typeof OathStatus[keyof typeof OathStatus];

// 誓约数据接口
export interface Oath {
  id: number;
  title: string;
  description: string;
  creater: string; // 创建者地址
  committer: string; // 守约人地址
  amount: string; // 质押金额 (wei)
  deadline: number; // 截止时间戳
  createdAt: number; // 创建时间戳
  status: OathStatus;
  upvotes: number; // 点赞数
  tokenAddress?: string; // ERC20代币地址
  checkpoints?: string[]; // 检查点列表
}

// 评论数据接口
export interface Comment {
  id: number;
  oathId: number;
  author: string; // 评论者地址
  content: string;
  timestamp: number;
}

// 用户统计数据接口
export interface UserStats {
  createdCount: number; // 创建的誓约数量
  completedCount: number; // 完成的誓约数量
  totalLikes: number; // 获得的总点赞数
}

// 平台统计数据接口
export interface PlatformStats {
  totalOaths: number; // 总誓约数量
  activeOaths: number; // 活跃誓约数量
  completedOaths: number; // 已完成誓约数量
  totalUsers: number; // 总用户数量
  totalStaked: string; // 总质押金额 (wei)
  totalComments: number; // 总评论数量
}

// 创建誓约的参数接口
export interface CreateOathParams {
  title: string;
  description: string;
  committer: string; // 守约人地址
  tokenAddress: string; // ERC20代币地址
  amount: string; // 质押金额 (wei)
  deadline: number; // 截止时间戳
  checkpoints: string[]; // 检查点列表
}

// 评估完成的参数接口
export interface EvaluateCompletionParams {
  oathId: number;
  isCompleted: boolean;
  feedback: string;
}

// 添加评论的参数接口
export interface AddCommentParams {
  oathId: number;
  content: string;
}

// 分页查询参数接口
export interface PaginationParams {
  offset: number;
  limit: number;
}

// 分页查询结果接口
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

// 合约事件接口
export interface ContractEvent {
  event: string;
  args: Record<string, any>;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

// 誓约创建事件
export interface OathCreatedEvent extends ContractEvent {
  event: 'OathCreated';
  args: {
    oathId: number;
    creater: string;
    committer: string;
    amount: string;
    deadline: number;
  };
}

// 誓约完成事件
export interface OathCompletedEvent extends ContractEvent {
  event: 'OathCompleted';
  args: {
    oathId: number;
    isCompleted: boolean;
    feedback: string;
  };
}

// 点赞事件
export interface OathLikedEvent extends ContractEvent {
  event: 'OathLiked';
  args: {
    oathId: number;
    user: string;
  };
}

// 评论事件
export interface CommentAddedEvent extends ContractEvent {
  event: 'CommentAdded';
  args: {
    oathId: number;
    commentId: number;
    author: string;
    content: string;
  };
}

// 联合事件类型
export type ChainOathEvent = 
  | OathCreatedEvent 
  | OathCompletedEvent 
  | OathLikedEvent 
  | CommentAddedEvent;

// 网络配置接口
export interface NetworkConfig {
  chainId: number;
  chainName: string;
  chainOathAddress: string;
  chainOathNFTAddress: string;
  blockExplorer: string;
}

// 代币信息接口
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance?: string;
}

// 交易结果接口
export interface TransactionResult {
  hash: string;
  blockNumber?: number;
  gasUsed?: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

// 合约调用选项接口
export interface ContractCallOptions {
  gasLimit?: number;
  gasPrice?: string;
  value?: string;
}

// 错误类型常量
export const ContractErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  USER_REJECTED: 'USER_REJECTED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_PARAMS: 'INVALID_PARAMS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  QUERY_FAILED: 'QUERY_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type ContractErrorType = typeof ContractErrorType[keyof typeof ContractErrorType];

// 合约错误接口
export interface ContractErrorInfo {
  type: ContractErrorType;
  message: string;
  code?: number;
  details?: any;
}

// 合约错误类
export class ChainOathError extends Error {
  public type: ContractErrorType;
  public code?: number;
  public details?: any;

  constructor(type: ContractErrorType, message: string, details?: any) {
    super(message);
    this.name = 'ChainOathError';
    this.type = type;
    this.details = details;
  }
}

// 管理员功能接口
export interface AdminFunctions {
  pauseContract: () => Promise<TransactionResult>;
  unpauseContract: () => Promise<TransactionResult>;
  emergencyWithdraw: (tokenAddress: string) => Promise<TransactionResult>;
  setNFTContract: (nftAddress: string) => Promise<TransactionResult>;
}

// 通知类型常量
export const NotificationType = {
  OATH_CREATED: 'OATH_CREATED',
  OATH_COMPLETED: 'OATH_COMPLETED',
  OATH_FAILED: 'OATH_FAILED',
  OATH_LIKED: 'OATH_LIKED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  ACHIEVEMENT_EARNED: 'ACHIEVEMENT_EARNED'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// 通知接口
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any; // 相关数据
}