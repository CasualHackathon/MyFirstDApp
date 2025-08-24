import { ethers, formatEther, parseEther, BrowserProvider } from 'ethers';
import { getCurrentNetworkConfig, CURRENT_NETWORK, TOKEN_OPTIONS } from '../contracts/config';
import { WETHABI } from '../contracts/ChainOathABI';


// ==================== Interface Definitions ====================

// 完成状态枚举
export const CompletionStatus = {
  PENDING: 0,
  COMPLETED: 1,
  FAILED: 2,
  EXPIRED: 3
} as const;

export type CompletionStatus = typeof CompletionStatus[keyof typeof CompletionStatus];

// 成就类型枚举
export const AchievementType = {
  FIRST_OATH: 0,
  OATH_KEEPER: 1,
  TRUSTED_CREATER: 2,
  COMMUNITY_STAR: 3,
  MILESTONE_MASTER: 4,
  EARLY_ADOPTER: 5
} as const;

export type AchievementType = typeof AchievementType[keyof typeof AchievementType];

// 誓约接口
export interface Oath {
  id: number;
  title: string;
  description: string;
  creater: string;
  committer: string;
  tokenAddress: string;
  amount: string; // 使用字符串避免精度问题
  deadline: number;
  checkpoints: string[];
  completionStatus: CompletionStatus;
  status: CompletionStatus; // 添加status属性作为completionStatus的别名
  upvotes: number;
  likeCount: number; // 添加likeCount属性作为upvotes的别名
  isActive: boolean;
  createdAt: number;
  evaluationFeedback: string;
}

// 评论接口
export interface Comment {
  id: number;
  oathId: number;
  author: string;
  content: string;
  timestamp: number;
}

// 成就接口
export interface Achievement {
  tokenId: number;
  achievementType: AchievementType;
  name: string;
  description: string;
  imageURI: string;
  mintedAt: number;
  rarity: string;
  hasAchievement?: boolean; // 可选属性，用于标识用户是否拥有该成就
}

// 用户统计接口
export interface UserStats {
  totalOaths: number;
  completedOaths: number;
  totalUpvotes: number;
  successRate: number; // 百分比
}

// 成就信息接口
export interface AchievementInfo {
  name: string;
  description: string;
  imagePrompt: string;
  rarity: string;
}

// 分页结果接口
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 合约地址配置
interface ContractAddresses {
  chainOathSecure: string;
  chainOathNFT: string;
}

// ==================== Contract Service Class ====================

export class ContractService {
  private provider: BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private oathContract: ethers.Contract | null = null;
  private nftContract: ethers.Contract | null = null;
  
  // 合约地址 - 使用配置文件中的地址
  private contractAddresses: ContractAddresses = {
    chainOathSecure: '',
    chainOathNFT: ''
  };
  
  constructor() {
    // 在构造函数中初始化合约地址，确保获取最新配置
    this.refreshContractAddresses();
  }
  
  /**
   * 刷新合约地址配置
   */
  private refreshContractAddresses(): void {
    const config = getCurrentNetworkConfig();
    this.contractAddresses = {
      chainOathSecure: config.chainOathAddress,
      chainOathNFT: config.chainOathNFTAddress
    };
    console.log('[ContractService] 刷新合约地址配置:', this.contractAddresses);
  }

  // ChainOathSecure合约ABI（简化版，实际使用时需要完整ABI）
  private oathContractABI = [
    'function createOath(string title, string description, address committer, address tokenAddress, uint256 amount, uint256 deadline, string[] checkpoints) external returns (uint256)',
    'function evaluateCompletion(uint256 oathId, bool isCompleted, string feedback) external',
    'function likeOath(uint256 oathId) external',
    'function addComment(uint256 oathId, string content) external',
    'function handleExpiredOath(uint256 oathId) external',
    'function withdrawFunds(uint256 oathId) external',
    'function getOath(uint256 oathId) external view returns (tuple(uint256 id, string title, string description, address creater, address committer, address tokenAddress, uint256 amount, uint256 createTime, uint256 deadline, string[] checkpoints, uint8 completionStatus, uint256 upvotes, bool isActive))',
    'function getUserCreatedOaths(address user) external view returns (uint256[])',
    'function getUserCommittedOaths(address user) external view returns (uint256[])',
    'function getAllOaths(uint256 offset, uint256 limit) external view returns (tuple(uint256 id, string title, string description, address creater, address committer, uint256 amount, uint256 deadline, uint256 createdAt, uint8 status, uint256 upvotes)[], uint256)',
    'function getOathComments(uint256 oathId) external view returns (tuple(uint256 id, uint256 oathId, address author, string content, uint256 timestamp)[])',
    'function hasUserLiked(uint256 oathId, address user) external view returns (bool)',
    'function getUserStats(address user) external view returns (uint256 totalOaths, uint256 completedOaths, uint256 totalUpvotes)',
    'function oathCounter() external view returns (uint256)',
    'event OathCreated(uint256 indexed oathId, address indexed creater, address indexed committer)',
    'event OathEvaluated(uint256 indexed oathId, bool isCompleted, address evaluator)',
    'event OathLiked(uint256 indexed oathId, address indexed user)',
    'event CommentAdded(uint256 indexed oathId, uint256 indexed commentId, address indexed author)'
  ];

  // ChainOathNFT合约ABI（简化版）
  private nftContractABI = [
    'function getUserTokens(address user) external view returns (uint256[])',
    'function hasAchievement(address user, uint8 achievementType) external view returns (bool)',
    'function getAchievement(uint256 tokenId) external view returns (tuple(uint8 achievementType, string name, string description, string imageURI, uint256 mintTime, bool isActive))',
    'function mintAchievement(uint8 achievementType, uint256 oathId, string metadataURI) external payable',
    'function balanceOf(address owner) external view returns (uint256)',
    'function tokenURI(uint256 tokenId) external view returns (string)',
    'event AchievementMinted(address indexed user, uint8 indexed achievementType, uint256 indexed tokenId)'
  ];

  // ==================== Initialization ====================

  /**
   * 初始化合约服务
   */
  async initialize(): Promise<void> {
    console.log('[ContractService] 开始初始化合约服务');
    try {
      // 刷新合约地址配置，确保使用最新配置
      this.refreshContractAddresses();
      console.log('[ContractService] 检查MetaMask是否安装');
      if (typeof window.ethereum === 'undefined') {
        console.error('[ContractService] MetaMask未安装');
        throw new Error('MetaMask is not installed');
      }
      console.log('[ContractService] MetaMask已安装');

      console.log('[ContractService] 创建BrowserProvider');
      this.provider = new BrowserProvider(window.ethereum);
      
      console.log('[ContractService] 请求账户访问权限');
      await this.provider.send('eth_requestAccounts', []);
      
      console.log('[ContractService] 获取Signer');
      this.signer = await this.provider.getSigner();
      const signerAddress = await this.signer.getAddress();
      console.log('[ContractService] Signer地址:', signerAddress);

      // 检查当前网络
      const network = await this.provider.getNetwork();
      const currentChainId = Number(network.chainId);
      const expectedChainId = getCurrentNetworkConfig().chainId;
      console.log('[ContractService] 当前网络链ID:', currentChainId);
      console.log('[ContractService] 期望网络链ID:', expectedChainId);
      console.log('[ContractService] 当前网络名称:', network.name);
      
      if (currentChainId !== expectedChainId) {
        console.error('[ContractService] 网络不匹配');
        console.error('[ContractService] 当前网络:', currentChainId, '期望网络:', expectedChainId);
        throw new Error(`Network mismatch. Current: ${currentChainId}, Expected: ${expectedChainId}. Please switch to the correct network.`);
      }
      console.log('[ContractService] 网络验证通过');

      console.log('[ContractService] 合约地址配置:', this.contractAddresses);
      console.log('[ContractService] 配置来源 - ChainOath:', getCurrentNetworkConfig().chainOathAddress);
      console.log('[ContractService] 配置来源 - NFT:', getCurrentNetworkConfig().chainOathNFTAddress);
      console.log('[ContractService] 环境变量 - VITE_NETWORK:', import.meta.env.VITE_NETWORK);
      console.log('[ContractService] 环境变量 - VITE_SEPOLIA_CONTRACT_ADDRESS:', import.meta.env.VITE_SEPOLIA_CONTRACT_ADDRESS);
      console.log('[ContractService] 环境变量 - VITE_SEPOLIA_NFT_CONTRACT_ADDRESS:', import.meta.env.VITE_SEPOLIA_NFT_CONTRACT_ADDRESS);
      console.log('[ContractService] 当前网络类型:', CURRENT_NETWORK);
      console.log('[ContractService] 完整网络配置:', getCurrentNetworkConfig());
      console.log('[ContractService] 用户报告的问题地址: 0x8AfcFd726F208a2ec88cCdf79C6976FACD614C6d');
      console.log('[ContractService] 实际配置地址:', this.contractAddresses.chainOathSecure);
      
      // 检查地址是否匹配用户报告的问题地址
      if (this.contractAddresses.chainOathSecure === '0x8AfcFd726F208a2ec88cCdf79C6976FACD614C6d') {
        console.error('[ContractService] 发现问题地址！这个地址不在我们的配置中');
        console.error('[ContractService] 可能的原因：1. 缓存问题 2. 环境变量错误 3. 配置文件被修改');
      }
      
      // 验证合约地址
      if (!this.contractAddresses.chainOathSecure || this.contractAddresses.chainOathSecure === '0x0000000000000000000000000000000000000000') {
        console.error('[ContractService] ChainOathSecure合约地址无效:', this.contractAddresses.chainOathSecure);
        throw new Error('Invalid ChainOathSecure contract address');
      }
      if (!this.contractAddresses.chainOathNFT || this.contractAddresses.chainOathNFT === '0x0000000000000000000000000000000000000000') {
        console.error('[ContractService] ChainOathNFT合约地址无效:', this.contractAddresses.chainOathNFT);
        throw new Error('Invalid ChainOathNFT contract address');
      }
      console.log('[ContractService] 合约地址验证通过');
      
      // 初始化合约实例
      console.log('[ContractService] 初始化ChainOathSecure合约实例，地址:', this.contractAddresses.chainOathSecure);
      this.oathContract = new ethers.Contract(
        this.contractAddresses.chainOathSecure,
        this.oathContractABI,
        this.signer
      );
      console.log('[ContractService] ChainOathSecure合约实例创建成功');

      console.log('[ContractService] 初始化ChainOathNFT合约实例，地址:', this.contractAddresses.chainOathNFT);
      this.nftContract = new ethers.Contract(
        this.contractAddresses.chainOathNFT,
        this.nftContractABI,
        this.signer
      );
      console.log('[ContractService] ChainOathNFT合约实例创建成功');
      
      console.log('[ContractService] 合约服务初始化完成');
    } catch (error) {
      console.error('[ContractService] 初始化合约服务失败:', error);
      console.error('[ContractService] 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * 获取当前用户地址
   */
  async getCurrentUserAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Contract service not initialized');
    }
    return await this.signer.getAddress();
  }

  /**
   * 检查合约是否已初始化
   */
  private ensureInitialized(): void {
    console.log('[ContractService] 检查合约初始化状态');
    console.log('[ContractService] oathContract存在:', !!this.oathContract);
    console.log('[ContractService] nftContract存在:', !!this.nftContract);
    console.log('[ContractService] signer存在:', !!this.signer);
    
    if (!this.oathContract || !this.nftContract) {
      console.error('[ContractService] 合约服务未初始化');
      throw new Error('Contract service not initialized. Call initialize() first.');
    }
    console.log('[ContractService] 合约初始化状态检查通过');
  }

  // ==================== Oath Management ====================

  /**
   * 创建誓约
   */
  async createOath(
    title: string,
    description: string,
    committer: string,
    tokenAddress: string,
    amount: string,
    deadline: number,
    checkpoints: string[]
  ): Promise<number> {
    console.log('[ContractService] 开始创建誓约');
    console.log('[ContractService] 创建参数:', {
      title,
      description,
      committer,
      tokenAddress,
      amount,
      deadline,
      checkpoints
    });
    
    this.ensureInitialized();
    
    try {
      console.log('[ContractService] 处理代币授权');
      
      // 检查是否为WETH代币，如果是则处理ETH到WETH的转换
      const wethAddress = TOKEN_OPTIONS.find(token => token.symbol === 'WETH')?.address;
      if (tokenAddress.toLowerCase() === wethAddress?.toLowerCase()) {
        console.log('[ContractService] 检测到WETH代币，开始处理ETH到WETH转换');
        await this.handleETHToWETHConversion(tokenAddress, amount);
      }
      
      // 首先需要授权代币
      const tokenAbi = [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];
      const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenAbi,
        this.signer
      );
      console.log('[ContractService] 代币合约实例创建成功');

      // 动态获取代币精度
      const decimalsRaw: bigint = await tokenContract.decimals();
      const decimals = Number(decimalsRaw);
      console.log('[ContractService] 代币decimals:', decimals);
      
      const amountBN = ethers.parseUnits(amount, decimals);
      console.log('[ContractService] 转换金额:', {
        original: amount,
        parsed: amountBN.toString()
      });

      // ===== 新增：余额充足性检查 =====
      if (!this.signer) {
        throw new Error('Signer未初始化，请先连接钱包');
      }
      const signerAddress = await this.signer.getAddress();
      const balance: bigint = await tokenContract.balanceOf(signerAddress);
      console.log('[ContractService] 当前代币余额:', balance.toString());
      if (balance < amountBN) {
        const requiredAmount = ethers.formatUnits(amountBN, decimals);
        const currentBalance = ethers.formatUnits(balance, decimals);
        throw new Error(`代币余额不足！当前余额: ${currentBalance}，需要: ${requiredAmount}。请前往去中心化交易所(如Uniswap)购买代币，或联系代币发行方获取测试代币。`);
      }
      // ===== 余额检查结束 =====

      console.log('[ContractService] 发送代币授权交易');
      const approveTx = await tokenContract.approve(this.contractAddresses.chainOathSecure, amountBN);
      console.log('[ContractService] 代币授权交易哈希:', approveTx.hash);
      
      console.log('[ContractService] 等待代币授权交易确认');
      await approveTx.wait();
      console.log('[ContractService] 代币授权交易确认成功');

      // 验证合约调用前的参数
      console.log('[ContractService] 验证创建誓约参数');
      console.log('[ContractService] - 合约地址:', this.contractAddresses.chainOathSecure);
      console.log('[ContractService] - 标题长度:', title.length);
      console.log('[ContractService] - 描述长度:', description.length);
      console.log('[ContractService] - 承诺者地址:', committer);
      console.log('[ContractService] - 代币地址:', tokenAddress);
      console.log('[ContractService] - 金额(BigInt):', amountBN.toString());
      console.log('[ContractService] - 截止时间:', deadline, '(', new Date(deadline * 1000).toLocaleString(), ')');
      console.log('[ContractService] - 检查点数量:', checkpoints.length);
      console.log('[ContractService] - 检查点内容:', checkpoints);
      
      // 验证参数有效性和类型
      console.log('[ContractService] 开始参数类型验证');
      console.log('[ContractService] - title类型:', typeof title, '值:', title);
      console.log('[ContractService] - description类型:', typeof description, '值:', description);
      console.log('[ContractService] - committer类型:', typeof committer, '值:', committer);
      console.log('[ContractService] - tokenAddress类型:', typeof tokenAddress, '值:', tokenAddress);
      console.log('[ContractService] - deadline类型:', typeof deadline, '值:', deadline);
      console.log('[ContractService] - checkpoints类型:', typeof checkpoints, '是否数组:', Array.isArray(checkpoints), '值:', checkpoints);
      console.log('[ContractService] - amountBN类型:', typeof amountBN, '值:', amountBN.toString());
      
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new Error('Title must be a non-empty string');
      }
      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        throw new Error('Description must be a non-empty string');
      }
      if (!committer || typeof committer !== 'string' || !ethers.isAddress(committer)) {
        throw new Error('Invalid committer address');
      }
      if (!tokenAddress || typeof tokenAddress !== 'string' || !ethers.isAddress(tokenAddress)) {
        throw new Error('Invalid token address');
      }
      if (typeof deadline !== 'number' || deadline <= Math.floor(Date.now() / 1000)) {
        throw new Error('Deadline must be a future timestamp number');
      }
      if (!Array.isArray(checkpoints) || checkpoints.length === 0) {
        throw new Error('Checkpoints must be a non-empty array');
      }
      // 验证checkpoints数组中的每个元素都是字符串
      for (let i = 0; i < checkpoints.length; i++) {
        if (typeof checkpoints[i] !== 'string' || checkpoints[i].trim().length === 0) {
          throw new Error(`Checkpoint ${i} must be a non-empty string`);
        }
      }
      if (typeof amountBN !== 'bigint' || amountBN <= 0n) {
        throw new Error('Amount must be a positive BigInt');
      }
      console.log('[ContractService] 参数类型和值验证通过');

      // 创建誓约
      console.log('[ContractService] 发送创建誓约交易');
      console.log('[ContractService] 调用合约方法: createOath');
      console.log('[ContractService] 合约实例地址:', await this.oathContract!.getAddress());
      
      // 最终参数验证和日志
      const finalParams = {
        title: String(title),
        description: String(description),
        committer: String(committer),
        tokenAddress: String(tokenAddress),
        amountBN: amountBN,
        deadline: Number(deadline),
        checkpoints: checkpoints.map(cp => String(cp))
      };
      console.log('[ContractService] 最终传递给合约的参数:');
      console.log('[ContractService] - title:', finalParams.title);
      console.log('[ContractService] - description:', finalParams.description);
      console.log('[ContractService] - committer:', finalParams.committer);
      console.log('[ContractService] - tokenAddress:', finalParams.tokenAddress);
      console.log('[ContractService] - amountBN:', finalParams.amountBN.toString());
      console.log('[ContractService] - deadline:', finalParams.deadline);
      console.log('[ContractService] - checkpoints:', finalParams.checkpoints);
      
      const tx = await this.oathContract!.createOath(
        finalParams.title,
        finalParams.description,
        finalParams.committer,
        finalParams.tokenAddress,
        finalParams.amountBN,
        finalParams.deadline,
        finalParams.checkpoints
      );
      console.log('[ContractService] 创建誓约交易哈希:', tx.hash);
      
      console.log('[ContractService] 等待创建誓约交易确认');
      const receipt = await tx.wait();
      console.log('[ContractService] 创建誓约交易确认成功');
      console.log('[ContractService] 交易收据:', receipt);
      
      // 解析事件日志
      let oathId: number | null = null;
      
      // 尝试从交易收据的logs中解析OathCreated事件
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.oathContract!.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsedLog && parsedLog.name === 'OathCreated') {
            oathId = Number(parsedLog.args.oathId);
            console.log('[ContractService] 从事件日志获取到誓约ID:', oathId);
            break;
          }
        } catch {
          // 忽略解析错误，继续尝试下一个日志
          continue;
        }
      }
      
      if (oathId !== null) {
        return oathId;
      }
      
      console.error('[ContractService] 未找到OathCreated事件');
      throw new Error('Failed to get oath ID from transaction');
    } catch (error) {
      console.error('[ContractService] 创建誓约失败:', error);
      console.error('[ContractService] 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // 分析错误类型并提供更友好的错误信息
      let userFriendlyMessage = '创建誓约失败';
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('eth余额不足')) {
          userFriendlyMessage = error.message; // 直接使用ETH转换的详细错误信息
        } else if (errorMessage.includes('execution reverted')) {
          console.error('[ContractService] 合约执行被回滚');
          if (errorMessage.includes('missing revert data')) {
            userFriendlyMessage = '合约调用失败：可能是参数验证失败或合约状态不正确。请检查：\n1. 网络连接是否正常\n2. 合约地址是否正确\n3. 参数是否有效\n4. 账户余额是否充足';
          } else {
            userFriendlyMessage = '合约执行被拒绝：' + error.message;
          }
        } else if (errorMessage.includes('network mismatch')) {
          userFriendlyMessage = '网络不匹配：请切换到正确的网络';
        } else if (errorMessage.includes('user rejected')) {
          userFriendlyMessage = '用户取消了交易';
        } else if (errorMessage.includes('insufficient funds')) {
          userFriendlyMessage = '账户余额不足';
        } else if (errorMessage.includes('nonce too high') || errorMessage.includes('nonce too low')) {
          userFriendlyMessage = '交易序号错误，请重试';
        } else if (errorMessage.includes('gas')) {
          userFriendlyMessage = 'Gas费用相关错误：' + error.message;
        } else {
          userFriendlyMessage = '创建誓约失败：' + error.message;
        }
      }
      
      console.error('[ContractService] 用户友好错误信息:', userFriendlyMessage);
      
      // 抛出包含用户友好信息的新错误
      const enhancedError = new Error(userFriendlyMessage);
      enhancedError.cause = error;
      throw enhancedError;
    }
  }

  /**
   * 评估誓约完成状态
   */
  async evaluateCompletion(
    oathId: number,
    isCompleted: boolean,
    feedback: string
  ): Promise<void> {
    this.ensureInitialized();
    
    try {
      const tx = await this.oathContract!.evaluateCompletion(oathId, isCompleted, feedback);
      await tx.wait();
    } catch (error) {
      console.error('Failed to evaluate completion:', error);
      throw error;
    }
  }

  /**
   * 点赞誓约
   */
  async likeOath(oathId: number): Promise<void> {
    this.ensureInitialized();
    
    try {
      const tx = await this.oathContract!.likeOath(oathId);
      await tx.wait();
    } catch (error) {
      console.error('Failed to like oath:', error);
      throw error;
    }
  }

  /**
   * 添加评论
   */
  async addComment(oathId: number, content: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      const tx = await this.oathContract!.addComment(oathId, content);
      await tx.wait();
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }

  /**
   * 处理过期誓约
   */
  async handleExpiredOath(oathId: number): Promise<void> {
    this.ensureInitialized();
    
    try {
      const tx = await this.oathContract!.handleExpiredOath(oathId);
      await tx.wait();
    } catch (error) {
      console.error('Failed to handle expired oath:', error);
      throw error;
    }
  }

  /**
   * 注意：资金提取功能已集成到evaluateCompletion函数中
   * 当评估完成时，资金会自动分配给相应的接收方
   * - 如果任务完成：资金转给承诺人
   * - 如果任务失败：资金退还给创建者
   */

  // ==================== Query Methods ====================

  /**
   * 获取誓约信息
   */
  async getOath(oathId: number): Promise<Oath> {
    this.ensureInitialized();
    
    try {
      const result = await this.oathContract!.getOath(oathId);
      
      const completionStatus = Number(result.completionStatus) as CompletionStatus;
      
      return {
        id: Number(result.id),
        title: result.title,
        description: result.description,
        creater: result.creater,
        committer: result.committer,
        tokenAddress: result.tokenAddress,
        amount: formatEther(result.amount),
        deadline: Number(result.deadline),
        checkpoints: result.checkpoints,
        completionStatus: completionStatus,
        status: completionStatus, // 添加status属性
        upvotes: Number(result.upvotes),
        likeCount: Number(result.upvotes), // 添加likeCount属性
        isActive: result.isActive,
        createdAt: Number(result.createTime),
        evaluationFeedback: '' // 合约中暂无此字段，设为空字符串
      };
    } catch (error) {
      console.error('Failed to get oath:', error);
      throw error;
    }
  }

  /**
   * 获取用户创建的誓约
   */
  async getUserCreatedOaths(userAddress: string): Promise<number[]> {
    this.ensureInitialized();
    
    try {
      const result = await this.oathContract!.getUserCreatedOaths(userAddress);
      return result.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Failed to get user created oaths:', error);
      throw error;
    }
  }

  /**
   * 获取用户承诺的誓约
   */
  async getUserCommittedOaths(userAddress: string): Promise<number[]> {
    this.ensureInitialized();
    
    try {
      const result = await this.oathContract!.getUserCommittedOaths(userAddress);
      return result.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Failed to get user committed oaths:', error);
      throw error;
    }
  }

  /**
   * 获取所有誓约（分页）
   */
  async getAllOaths(page: number = 1, pageSize: number = 10): Promise<PaginatedResult<number>> {
    this.ensureInitialized();
    
    try {
      console.log('[ContractService] 调用getAllOaths，参数:', { page, pageSize });
      
      // 首先检查合约中的总数据量
      const totalCount = await this.oathContract!.oathCounter();
      const totalNumber = Number(totalCount);
      console.log('[ContractService] 合约中总誓约数量:', totalNumber);
      
      // 如果没有数据，直接返回空结果
      if (totalNumber === 0) {
        console.log('[ContractService] 合约中没有誓约数据，返回空结果');
        return {
          items: [],
          total: 0,
          page,
          pageSize,
          hasMore: false
        };
      }
      
      const offset = (page - 1) * pageSize;
      console.log('[ContractService] 计算offset:', offset);
      
      // 检查offset是否超出范围
      if (offset >= totalNumber) {
        console.log('[ContractService] offset超出范围，返回空结果');
        return {
          items: [],
          total: totalNumber,
          page,
          pageSize,
          hasMore: false
        };
      }
      
      // 调整pageSize以避免超出范围
      const adjustedPageSize = Math.min(pageSize, totalNumber - offset);
      console.log('[ContractService] 调整后的pageSize:', adjustedPageSize);
      
      // 根据ABI，getAllOaths返回 [tuple[], total]
      const result = await this.oathContract!.getAllOaths(offset, adjustedPageSize);
      console.log('[ContractService] getAllOaths原始结果:', result);
      
      // 解构返回值：[oathsArray, total]
      const [oathsArray, total] = result;
      console.log('[ContractService] 解构结果:', { oathsArrayLength: oathsArray.length, total });
      
      // 从tuple数组中提取ID
      const oathIds = oathsArray.map((oath: any) => Number(oath.id));
      console.log('[ContractService] 提取的誓约IDs:', oathIds);
      
      const hasMore = offset + adjustedPageSize < totalNumber;
      
      console.log('[ContractService] 返回结果:', {
        itemsCount: oathIds.length,
        total: totalNumber,
        page,
        pageSize,
        hasMore
      });
      
      return {
        items: oathIds,
        total: totalNumber,
        page,
        pageSize,
        hasMore
      };
    } catch (error) {
      console.error('[ContractService] Failed to get all oaths:', error);
      console.error('[ContractService] 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * 获取誓约评论
   */
  async getOathComments(oathId: number): Promise<Comment[]> {
    this.ensureInitialized();
    
    try {
      const result = await this.oathContract!.getOathComments(oathId);
      
      return result.map((comment: any) => ({
        id: Number(comment.id),
        oathId: Number(comment.oathId),
        author: comment.author,
        content: comment.content,
        timestamp: Number(comment.timestamp)
      }));
    } catch (error) {
      console.error('Failed to get oath comments:', error);
      throw error;
    }
  }

  /**
   * 检查用户是否已点赞
   */
  async hasUserLiked(oathId: number, userAddress: string): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      return await this.oathContract!.hasUserLiked(oathId, userAddress);
    } catch (error) {
      console.error('Failed to check user like status:', error);
      throw error;
    }
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(userAddress: string): Promise<UserStats> {
    this.ensureInitialized();
    
    try {
      const result = await this.oathContract!.getUserStats(userAddress);
      const totalOaths = Number(result.totalOaths);
      const completedOaths = Number(result.completedOaths);
      const successRate = totalOaths > 0 ? Math.round((completedOaths * 100) / totalOaths) : 0;
      
      return {
        totalOaths,
        completedOaths,
        totalUpvotes: Number(result.totalUpvotes),
        successRate
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      throw error;
    }
  }

  // ==================== Achievement System ====================

  /**
   * 检查用户是否拥有特定成就
   */
  async hasAchievement(userAddress: string, achievementType: AchievementType): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      return await this.nftContract!.hasAchievement(userAddress, achievementType);
    } catch (error) {
      console.error('Failed to check achievement:', error);
      throw error;
    }
  }

  /**
   * 获取用户的成就NFT
   */
  async getUserTokens(userAddress: string): Promise<number[]> {
    this.ensureInitialized();
    
    try {
      const result = await this.nftContract!.getUserTokens(userAddress);
      return result.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Failed to get user tokens:', error);
      throw error;
    }
  }

  /**
   * 获取成就信息
   */
  async getAchievement(tokenId: number): Promise<Achievement> {
    this.ensureInitialized();
    
    try {
      const result = await this.nftContract!.getAchievement(tokenId);
      const achievementInfo = await this.getAchievementInfo(result.achievementType);
      
      return {
        tokenId,
        achievementType: result.achievementType,
        name: result.name,
        description: result.description,
        imageURI: result.imageURI,
        mintedAt: Number(result.mintTime),
        rarity: achievementInfo.rarity
      };
    } catch (error) {
      console.error('Failed to get achievement:', error);
      throw error;
    }
  }

  /**
   * 获取成就信息（本地映射）
   */
  async getAchievementInfo(achievementType: AchievementType): Promise<AchievementInfo> {
    const achievementInfoMap: { [key in AchievementType]: AchievementInfo } = {
      [AchievementType.FIRST_OATH]: {
        name: "首次誓约",
        description: "创建第一个誓约",
        imagePrompt: "A golden badge with a handshake symbol",
        rarity: "Common"
      },
      [AchievementType.OATH_KEEPER]: {
        name: "守约达人",
        description: "完成1个誓约",
        imagePrompt: "A silver shield with a checkmark",
        rarity: "Uncommon"
      },
      [AchievementType.TRUSTED_CREATER]: {
        name: "信任创建者",
        description: "创建的誓约获得2个点赞",
        imagePrompt: "A bronze crown with stars",
        rarity: "Rare"
      },
      [AchievementType.COMMUNITY_STAR]: {
        name: "社区之星",
        description: "获得总计3个点赞",
        imagePrompt: "A platinum star with radiating light",
        rarity: "Epic"
      },
      [AchievementType.MILESTONE_MASTER]: {
        name: "里程碑大师",
        description: "创建2个誓约",
        imagePrompt: "A diamond trophy with multiple gems",
        rarity: "Legendary"
      },
      [AchievementType.EARLY_ADOPTER]: {
        name: "早期采用者",
        description: "在合约部署后24小时内创建誓约",
        imagePrompt: "A special badge with clock and rocket",
        rarity: "Mythic"
      }
    };
    
    return achievementInfoMap[achievementType];
  }

  /**
   * 获取用户NFT余额
   */
  async getUserNFTBalance(userAddress: string): Promise<number> {
    this.ensureInitialized();
    
    try {
      const result = await this.nftContract!.balanceOf(userAddress);
      return Number(result);
    } catch (error) {
      console.error('Failed to get user NFT balance:', error);
      throw error;
    }
  }

  /**
   * 铸造成就NFT
   */
  async mintAchievement(
    achievementType: AchievementType,
    oathId: number,
    metadataURI: string
  ): Promise<number> {
    this.ensureInitialized();
    
    try {
      const tx = await this.nftContract!.mintAchievement(
        achievementType,
        oathId,
        metadataURI,
        { value: parseEther('0.01') } // 假设铸造费用为0.01 ETH
      );
      
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === 'AchievementMinted');
      
      if (event) {
        return Number(event.args.tokenId);
      }
      
      throw new Error('Failed to get token ID from transaction');
    } catch (error) {
      console.error('Failed to mint achievement:', error);
      throw error;
    }
  }

  // ==================== ETH to WETH Conversion ====================

  /**
   * 处理ETH到WETH的转换
   */
  private async handleETHToWETHConversion(wethAddress: string, requiredAmount: string): Promise<void> {
    console.log('[ContractService] 开始处理ETH到WETH转换');
    
    try {
      if (!this.signer) {
        throw new Error('Signer未初始化');
      }
      
      const signerAddress = await this.signer.getAddress();
      console.log('[ContractService] 用户地址:', signerAddress);
      
      // 创建WETH合约实例
      const wethContract = new ethers.Contract(wethAddress, WETHABI, this.signer);
      
      // 获取WETH精度
      const decimals = await wethContract.decimals();
      const requiredAmountBN = ethers.parseUnits(requiredAmount, decimals);
      console.log('[ContractService] 需要的WETH数量:', requiredAmountBN.toString());
      
      // 检查当前WETH余额
      const wethBalance = await wethContract.balanceOf(signerAddress);
      console.log('[ContractService] 当前WETH余额:', wethBalance.toString());
      
      // 如果WETH余额不足，则将ETH转换为WETH
      if (wethBalance < requiredAmountBN) {
        const shortfall = requiredAmountBN - wethBalance;
        console.log('[ContractService] WETH余额不足，需要转换ETH数量:', shortfall.toString());
        
        // 检查ETH余额
        const ethBalance = await this.provider!.getBalance(signerAddress);
        console.log('[ContractService] 当前ETH余额:', ethBalance.toString());
        
        // 预留一些ETH用于gas费用
        const gasReserve = ethers.parseEther('0.01'); // 预留0.01 ETH
        const availableETH = ethBalance - gasReserve;
        
        if (availableETH < shortfall) {
          const requiredETH = ethers.formatEther(shortfall);
          const currentETH = ethers.formatEther(availableETH);
          throw new Error(`ETH余额不足！需要 ${requiredETH} ETH 来转换为WETH，但当前可用余额只有 ${currentETH} ETH（已预留gas费用）`);
        }
        
        console.log('[ContractService] 开始将ETH转换为WETH');
        const depositTx = await wethContract.deposit({ value: shortfall });
        console.log('[ContractService] ETH转WETH交易哈希:', depositTx.hash);
        
        await depositTx.wait();
        console.log('[ContractService] ETH转WETH交易确认成功');
        
        // 验证转换后的余额
        const newWethBalance = await wethContract.balanceOf(signerAddress);
        console.log('[ContractService] 转换后WETH余额:', newWethBalance.toString());
        
        if (newWethBalance < requiredAmountBN) {
          throw new Error('WETH转换后余额仍然不足');
        }
      } else {
        console.log('[ContractService] WETH余额充足，无需转换');
      }
    } catch (error) {
      console.error('[ContractService] ETH到WETH转换失败:', error);
      throw error;
    }
  }

  // ==================== Utility Methods ====================

  /**
   * 获取点赞排行榜（前5名）
   */
  async getTopLikedOaths(limit: number = 5): Promise<Oath[]> {
    this.ensureInitialized();
    
    try {
      // 获取所有誓约ID
      const allOathsResult = await this.getAllOaths(1, 1000); // 假设不超过1000个誓约
      const oathIds = allOathsResult.items;
      
      // 获取所有誓约详情
      const oaths = await Promise.all(
        oathIds.map(id => this.getOath(id))
      );
      
      // 按点赞数排序并返回前N名
      return oaths
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get top liked oaths:', error);
      throw error;
    }
  }

  /**
   * 获取用户相关的所有誓约（创建的、承诺的、点赞的、评论的）
   */
  async getUserRelatedOaths(userAddress: string): Promise<{
    created: Oath[];
    committed: Oath[];
    liked: Oath[];
    commented: Oath[];
  }> {
    this.ensureInitialized();
    
    try {
      // 获取创建的和承诺的誓约
      const [createdIds, committedIds] = await Promise.all([
        this.getUserCreatedOaths(userAddress),
        this.getUserCommittedOaths(userAddress)
      ]);
      
      const [createdOaths, committedOaths] = await Promise.all([
        Promise.all(createdIds.map(id => this.getOath(id))),
        Promise.all(committedIds.map(id => this.getOath(id)))
      ]);
      
      // 获取点赞的和评论的誓约
      const likedOaths: Oath[] = [];
      const commentedOaths: Oath[] = [];
      
      try {
        // 获取所有誓约来检查点赞和评论
        const allOathsResult = await this.getAllOaths(1, 1000); // 获取大量誓约
        const allOathIds = allOathsResult.items;
        
        // 检查每个誓约是否被用户点赞或评论
        for (const oathId of allOathIds) {
          try {
            // 检查是否点赞
            const hasLiked = await this.hasUserLiked(oathId, userAddress);
            if (hasLiked) {
              const oath = await this.getOath(oathId);
              likedOaths.push(oath);
            }
            
            // 检查是否评论
            const comments = await this.getOathComments(oathId);
            const hasCommented = comments.some(comment => comment.author.toLowerCase() === userAddress.toLowerCase());
            if (hasCommented) {
              const oath = await this.getOath(oathId);
              // 避免重复添加（如果用户既点赞又评论了同一个誓约）
              if (!commentedOaths.find(o => o.id === oath.id)) {
                commentedOaths.push(oath);
              }
            }
          } catch (error) {
            console.warn(`Failed to check oath ${oathId}:`, error);
            // 继续处理其他誓约
          }
        }
      } catch (error) {
        console.error('Failed to get liked/commented oaths:', error);
        // 如果获取失败，返回空数组
      }
      
      return {
        created: createdOaths,
        committed: committedOaths,
        liked: likedOaths,
        commented: commentedOaths
      };
    } catch (error) {
      console.error('Failed to get user related oaths:', error);
      throw error;
    }
  }

  /**
   * 检查用户的所有成就状态
   */
  async checkMyAchievements(userAddress: string): Promise<{
    [key in AchievementType]: {
      hasAchievement: boolean;
      info: AchievementInfo;
    }
  }> {
    this.ensureInitialized();
    
    try {
      const achievementTypes = Object.values(AchievementType).filter(v => typeof v === 'number') as AchievementType[];
      
      const results = await Promise.all(
        achievementTypes.map(async (type) => {
          const [hasAchievement, info] = await Promise.all([
            this.hasAchievement(userAddress, type),
            this.getAchievementInfo(type)
          ]);
          
          return {
            type,
            hasAchievement,
            info
          };
        })
      );
      
      const achievementMap = {} as any;
      results.forEach(result => {
        achievementMap[result.type] = {
          hasAchievement: result.hasAchievement,
          info: result.info
        };
      });
      
      return achievementMap;
    } catch (error) {
      console.error('Failed to check my achievements:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const contractService = new ContractService();