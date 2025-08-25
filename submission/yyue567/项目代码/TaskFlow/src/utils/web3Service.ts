import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import taskflowABI from './taskflowABI.json';
import type { Task, CreateTaskParams } from '../types/task';

// 智能合约ABI - 从Remix部署后获取
const TASKFLOW_ABI: any[] = taskflowABI.abi;

// 智能合约地址 - 您需要从Remix部署后获取
const TASKFLOW_ADDRESS = '0xb16113fF517141F10c65ba5414821bf326882C8e';

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private isConnectedFlag: boolean = false;

  // 检查是否已连接
  isConnected(): boolean {
    return this.isConnectedFlag && !!this.signer && !!this.contract;
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnectedFlag;
  }

  // 监听钱包状态变化
  async setupWalletListeners() {
    const ethereum = await detectEthereumProvider();
    
    if (ethereum) {
      // 监听账户变化
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // 用户断开连接
          this.isConnectedFlag = false;
          this.provider = null;
          this.signer = null;
          this.contract = null;
        } else {
          // 账户切换，重新连接
          this.connect();
        }
      });

      // 监听链切换
      ethereum.on('chainChanged', () => {
        // 链切换时重新连接
        this.connect();
      });

      // 监听连接状态
      ethereum.on('connect', () => {
        this.isConnectedFlag = true;
      });

      ethereum.on('disconnect', () => {
        this.isConnectedFlag = false;
        this.provider = null;
        this.signer = null;
        this.contract = null;
      });
    }
  }

  async connect() {
    try {
      const ethereum = await detectEthereumProvider();
      
      if (!ethereum) {
        throw new Error('请安装MetaMask钱包');
      }

      // 请求用户连接钱包
      await (ethereum as any).request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.BrowserProvider(ethereum as any);
      this.signer = await this.provider.getSigner();
      
      // 创建合约实例
      this.contract = new ethers.Contract(
        TASKFLOW_ADDRESS,
        TASKFLOW_ABI,
        this.signer
      );

      this.isConnectedFlag = true;
      return true;
    } catch (error) {
      console.error('连接钱包失败:', error);
      this.isConnectedFlag = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      const ethereum = await detectEthereumProvider();
      
      if (ethereum) {
        // 请求断开连接
        await (ethereum as any).request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
      }
      
      // 清空本地状态
      this.provider = null;
      this.signer = null;
      this.contract = null;
      
      return true;
    } catch (error) {
      console.error('断开钱包连接失败:', error);
      // 即使断开失败，也要清空本地状态
      this.provider = null;
      this.signer = null;
      this.contract = null;
      throw error;
    }
  }

  async getContract() {
    if (!this.contract) {
      throw new Error('请先连接钱包');
    }
    return this.contract;
  }

  async getSigner() {
    if (!this.signer) {
      throw new Error('请先连接钱包');
    }
    return this.signer;
  }

  async getAddress() {
    if (!this.signer) {
      throw new Error('请先连接钱包');
    }
    return await this.signer.getAddress();
  }

  // 任务相关方法
  async createTask(params: CreateTaskParams) {
    const contract = await this.getContract();
    const amountWei = ethers.parseEther(params.amount);
    
    const tx = await contract.createTask(amountWei, params.deadline, params.title, params.description);
    return await tx.wait();
  }

  async getTasks(): Promise<Task[]> {
    const contract = await this.getContract();
    const tasks = await contract.getTasks();
    return this.formatTasks(tasks);
  }

  async acceptTask(taskId: number) {
    const contract = await this.getContract();
    const tx = await contract.acceptTask(taskId);
    return await tx.wait();
  }

  async getAcceptedBy(taskId: number) {
    const contract = await this.getContract();
    return await contract.getAcceptedBy(taskId);
  }

  // 工具方法
  formatTask(task: any): Task {
    return {
      id: Number(task.id),
      userId: Number(task.userId),
      amount: ethers.formatEther(task.amount),
      deadline: task.deadline,
      user: task.user,
      title: task.title,
      description: task.description,
      acceptedBy: task.acceptedBy
    };
  }

  formatTasks(tasks: any[]): Task[] {
    return tasks.map(task => this.formatTask(task));
  }

  // 事件监听方法
  onTaskCreated(callback: (taskId: number, title: string, creator: string) => void) {
    if (!this.contract) {
      console.warn('合约未连接，无法监听事件');
      return;
    }
    
    this.contract.on('TaskCreated', (taskId, creator, bounty, ipfsHash) => {
      callback(Number(taskId), ipfsHash, creator);
    });
  }

  onTaskAccepted(callback: (taskId: number, worker: string) => void) {
    if (!this.contract) {
      console.warn('合约未连接，无法监听事件');
      return;
    }
    
    this.contract.on('TaskAccepted', (taskId, worker) => {
      callback(Number(taskId), worker);
    });
  }

  // 移除事件监听
  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

export const web3Service = new Web3Service();
