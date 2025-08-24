import { ethers } from 'ethers';
import { getCurrentNetworkConfig, getNetworkDisplayName } from '../contracts/config';

/**
 * 钱包连接状态
 */
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
}

/**
 * 钱包连接服务
 */
export class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private listeners: ((state: WalletState) => void)[] = [];
  private currentAccount: string | null = null;
  private targetChainId: number;

  constructor() {
    // 从配置中获取目标链ID
    this.targetChainId = getCurrentNetworkConfig().chainId;
    console.log('[WalletService] 初始化，目标链ID:', this.targetChainId);
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (typeof window !== 'undefined' && window.ethereum) {
      // 监听账户变化
      window.ethereum.on('accountsChanged', (...args: unknown[]) => {
        const accounts = args[0] as string[];
        console.log('账户变化:', accounts);
        if (accounts.length > 0) {
          this.handleAccountChange(accounts[0]);
        } else {
          this.disconnect();
        }
      });

      // 监听网络变化
      window.ethereum.on('chainChanged', (...args: unknown[]) => {
        const chainId = args[0] as string;
        console.log('网络变化:', chainId);
        const parsedChainId = parseInt(chainId, 16);
        this.handleChainChange(parsedChainId);
      });
    }
  }

  /**
   * 处理账户变化
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleAccountChange(_newAddress: string): Promise<void> {
    try {
      if (this.provider) {
        this.signer = await this.provider.getSigner();
        await this.notifyStateChange();
      }
    } catch (error) {
      console.error('处理账户变化失败:', error);
    }
  }

  /**
   * 处理网络变化
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleChainChange(_newChainId: number): Promise<void> {
    try {
      await this.notifyStateChange();
    } catch (error) {
      console.error('处理网络变化失败:', error);
    }
  }

  /**
   * 连接钱包
   */
  async connect(): Promise<string> {
    console.log('[WalletService] 开始连接钱包');
    
    if (!window.ethereum) {
      console.error('[WalletService] MetaMask未安装');
      throw new Error('Please install MetaMask!');
    }
    console.log('[WalletService] MetaMask已检测到');

    try {
      console.log('[WalletService] 请求钱包账户权限');
      // 请求连接钱包
      const accounts: string[] = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];
      console.log('[WalletService] 获取到账户列表:', accounts);

      if (accounts.length === 0) {
        console.error('[WalletService] 未找到任何账户');
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      this.currentAccount = account;
      console.log('[WalletService] 设置当前账户:', account);
      
      // 初始化provider和signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      console.log('[WalletService] Provider和Signer初始化完成');
      
      // 验证网络
      console.log('[WalletService] 开始验证网络');
      await this.verifyNetwork();
      console.log('[WalletService] 网络验证完成');
      
      console.log('[WalletService] 钱包连接成功:', account);
      return account;
    } catch (error) {
      console.error('[WalletService] 钱包连接失败:', error);
      console.error('[WalletService] 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * 断开钱包连接
   */
  disconnect(): void {
    console.log('[WalletService] 开始断开钱包连接');
    this.provider = null;
    this.signer = null;
    this.currentAccount = null;
    this.notifyStateChange();
    console.log('[WalletService] 钱包已断开连接');
  }

  /**
   * 验证网络
   */
  private async verifyNetwork(): Promise<void> {
    console.log('[WalletService] 开始验证网络');
    
    if (!window.ethereum) {
      console.error('[WalletService] MetaMask未找到');
      throw new Error('MetaMask not found');
    }

    try {
      console.log('[WalletService] 获取当前网络链ID');
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      
      const currentChainId = parseInt(chainId, 16);
      console.log('[WalletService] 当前链ID:', {
        hex: chainId,
        decimal: currentChainId,
        target: this.targetChainId
      });
      
      if (currentChainId !== this.targetChainId) {
        console.log('[WalletService] 网络不匹配，尝试切换网络');
        // 尝试切换网络
        await this.switchNetwork();
        console.log('[WalletService] 网络切换完成');
      } else {
        console.log('[WalletService] 网络匹配，无需切换');
      }
      
      const networkName = this.getNetworkName(currentChainId);
      console.log(`[WalletService] 网络验证成功: ${networkName} (Chain ID: ${currentChainId})`);
    } catch (error) {
      console.error('[WalletService] 网络验证失败:', error);
      console.error('[WalletService] 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * 获取当前钱包状态
   */
  async getWalletState(): Promise<WalletState> {
    try {
      if (!this.provider || !this.signer) {
        return {
          isConnected: false,
          address: null,
          chainId: null,
          balance: null
        };
      }

      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(address);

      return {
        isConnected: true,
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance)
      };
    } catch (error) {
      console.error('获取钱包状态失败:', error);
      return {
        isConnected: false,
        address: null,
        chainId: null,
        balance: null
      };
    }
  }

  /**
   * 获取当前地址
   */
  async getCurrentAddress(): Promise<string | null> {
    try {
      if (!this.signer) {
        console.log('[WalletService] Signer未初始化，返回缓存的账户:', this.currentAccount);
        return this.currentAccount;
      }
      const address = await this.signer.getAddress();
      console.log('[WalletService] 从Signer获取地址:', address);
      return address;
    } catch (error) {
      console.error('[WalletService] 获取当前地址失败:', error);
      console.log('[WalletService] 返回缓存的账户:', this.currentAccount);
      return this.currentAccount;
    }
  }

  /**
   * 获取 Provider
   */
  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  /**
   * 获取 Signer
   */
  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }

  /**
   * 添加状态变化监听器
   */
  addStateListener(listener: (state: WalletState) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除状态变化监听器
   */
  removeStateListener(listener: (state: WalletState) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知状态变化
   */
  private async notifyStateChange(): Promise<void> {
    const state = await this.getWalletState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('状态监听器执行失败:', error);
      }
    });
  }

  /**
   * 切换网络（私有方法）
   */
  private async switchNetwork(): Promise<void> {
    console.log('[WalletService] 开始切换网络');
    
    if (!window.ethereum) {
      console.error('[WalletService] MetaMask未找到');
      throw new Error('MetaMask not found');
    }

    try {
      const targetChainIdHex = `0x${this.targetChainId.toString(16)}`;
      console.log('[WalletService] 尝试切换到网络:', {
        chainId: this.targetChainId,
        chainIdHex: targetChainIdHex
      });
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainIdHex }],
      });
      console.log('[WalletService] 网络切换成功');
    } catch (switchError: any) {
      console.log('[WalletService] 网络切换失败:', switchError);
      // 如果网络不存在，尝试添加网络
      if (switchError.code === 4902) {
        console.log('[WalletService] 网络不存在，尝试添加网络');
        await this.addNetwork();
        console.log('[WalletService] 网络添加完成');
      } else {
        console.error('[WalletService] 网络切换错误:', switchError);
        throw switchError;
      }
    }
  }

  /**
   * 切换到指定网络（公共方法）
   */
  async switchToNetwork(chainId: number): Promise<void> {
    console.log('[WalletService] 切换到指定网络:', chainId);
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask 未安装');
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
      console.log('[WalletService] 网络切换成功');
    } catch (error: unknown) {
      // 如果网络不存在，尝试添加网络
      const err = error as { code?: number };
      if (err.code === 4902) {
        console.log('[WalletService] 网络不存在，尝试添加');
        await this.addNetworkByChainId(chainId);
      } else {
        console.error('[WalletService] 网络切换失败:', error);
        throw error;
      }
    }
  }

  /**
   * 添加网络（私有方法）
   */
  private async addNetwork(): Promise<void> {
    console.log('[WalletService] 开始添加网络');
    
    if (!window.ethereum) {
      console.error('[WalletService] MetaMask未找到');
      throw new Error('MetaMask not found');
    }

    const networkParams = {
      chainId: `0x${this.targetChainId.toString(16)}`,
      chainName: this.getNetworkName(this.targetChainId),
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: [this.getRpcUrl(this.targetChainId)],
      blockExplorerUrls: [this.getBlockExplorerUrl(this.targetChainId)],
    };
    
    console.log('[WalletService] 网络参数:', networkParams);

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkParams],
      });
      console.log('[WalletService] 网络添加成功');
    } catch (error) {
      console.error('[WalletService] 网络添加失败:', error);
      throw error;
    }
  }

  /**
   * 根据链ID添加网络到 MetaMask
   */
  private async addNetworkByChainId(chainId: number): Promise<void> {
    console.log('[WalletService] 添加指定网络:', chainId);
    if (!window.ethereum) {
      throw new Error('MetaMask 未安装');
    }

    // 这里可以根据 chainId 添加对应的网络配置
    // 目前只支持 Sepolia 测试网
    if (chainId === 11155111) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia Test Network',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          blockExplorerUrls: ['https://sepolia.etherscan.io/']
        }]
      });
      console.log('[WalletService] Sepolia网络添加成功');
    } else {
      console.error('[WalletService] 不支持的网络ID:', chainId);
      throw new Error(`不支持的网络 ID: ${chainId}`);
    }
  }

  /**
   * 获取网络名称
   */
  private getNetworkName(chainId: number): string {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 11155111:
        return 'Sepolia Test Network';
      case 5:
        return 'Goerli Test Network';
      default:
        return getNetworkDisplayName();
    }
  }

  /**
   * 获取RPC URL
   */
  private getRpcUrl(chainId: number): string {
    switch (chainId) {
      case 1:
        return 'https://mainnet.infura.io/v3/';
      case 11155111:
        return 'https://sepolia.infura.io/v3/';
      case 5:
        return 'https://goerli.infura.io/v3/';
      default:
        return 'https://sepolia.infura.io/v3/';
    }
  }

  /**
   * 获取区块浏览器URL
   */
  private getBlockExplorerUrl(chainId: number): string {
    switch (chainId) {
      case 1:
        return 'https://etherscan.io/';
      case 11155111:
        return 'https://sepolia.etherscan.io/';
      case 5:
        return 'https://goerli.etherscan.io/';
      default:
        return 'https://sepolia.etherscan.io/';
    }
  }
}

// 创建全局钱包服务实例
export const walletService = new WalletService();