import { ethers } from 'ethers';
import DDProjectFactoryABI from '../contracts/abi/DDProjectFactory.json';
import DDProjectABI from '../contracts/abi/DDProject.json';
import { ProjectSummary, ProjectInfo, UpdateRecord, CreateProjectForm, UpdateProjectForm } from '../types';
import { CreateProjectDebugger } from '../utils/createProjectDebugger';

// 合约地址 - 已部署到 Sepolia 测试网
const FACTORY_ADDRESS = process.env.REACT_APP_FACTORY_ADDRESS || '0xB2CA6CAaF1D6e0b34b5D091D28e17c4de14651DC';
const DDTOKEN_ADDRESS = process.env.REACT_APP_TOKEN_ADDRESS || '0xBC7731389947dfB1C39f2Cdf88052674Be26691a';

export class ContractService {
  private factoryContract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(signer: ethers.Signer) {
    this.signer = signer;
    this.factoryContract = new ethers.Contract(FACTORY_ADDRESS, DDProjectFactoryABI, signer);
  }

  // 获取所有项目
  async getAllProjects(): Promise<ProjectSummary[]> {
    try {
      console.log('🔍 开始获取所有项目...');
      
      // 首先获取项目统计信息
      const stats = await this.factoryContract.getProjectStats();
      const totalProjects = stats.totalProjectsCount;
      console.log('📊 总项目数:', totalProjects.toString());
      
      if (totalProjects.toNumber() === 0) {
        console.log('📭 没有项目');
        return [];
      }
      
      // 尝试使用 getProjectsByCategory 获取所有项目
      // 由于所有项目都是 DeFi 分类，我们可以通过这个方法来获取
      console.log('🔍 尝试通过分类获取项目...');
      const projectsByCategory = await this.factoryContract.getProjectsByCategory("DeFi");
      
      console.log('✅ 通过分类获取到项目:', projectsByCategory.length);
      
      const projects: ProjectSummary[] = projectsByCategory.map((project: any) => ({
        projectId: project.projectId.toNumber(),
        projectAddress: project.projectAddress,
        name: project.name,
        category: project.category,
        creator: project.creator,
        createdAt: project.createdAt.toNumber(),
        isActive: project.isActive,
      }));
      
      console.log('📋 解析后的项目列表:', projects);
      return projects;
      
    } catch (error) {
      console.error('❌ 获取项目失败:', error);
      
      // 如果通过分类获取失败，尝试备用方法
      try {
        console.log('🔄 尝试备用方法...');
        const totalProjects = await this.factoryContract.totalProjects();
        const projects: ProjectSummary[] = [];
        
        // 尝试获取前几个项目
        for (let i = 1; i <= Math.min(totalProjects.toNumber(), 10); i++) {
          try {
            const project = await this.factoryContract.getProject(i);
            projects.push({
              projectId: project.projectId.toNumber(),
              projectAddress: project.projectAddress,
              name: project.name,
              category: project.category,
              creator: project.creator,
              createdAt: project.createdAt.toNumber(),
              isActive: project.isActive,
            });
            console.log(`✅ 项目 ${i} 获取成功:`, project.name);
          } catch (projectError) {
            console.warn(`⚠️ 项目 ${i} 获取失败:`, projectError);
            // 继续尝试下一个项目
          }
        }
        
        if (projects.length > 0) {
          console.log('📋 备用方法获取到项目:', projects.length);
          return projects;
        }
      } catch (backupError) {
        console.error('❌ 备用方法也失败了:', backupError);
      }
      
      throw error;
    }
  }

  // 创建新项目
  async createProject(formData: CreateProjectForm): Promise<{ projectId: number; projectAddress: string }> {
    try {
      console.log('🚀 === 开始创建项目 ===');
      
      // 创建调试器并运行诊断
      const projectDebugger = new CreateProjectDebugger(this.signer, FACTORY_ADDRESS);
      console.log('🔍 运行预检查诊断...');
      
      try {
        await projectDebugger.fullDiagnosis(formData);
        console.log('✅ 预检查诊断通过');
      } catch (diagnosticError) {
        console.warn('⚠️ 预检查诊断发现问题:', diagnosticError);
        console.log('继续尝试创建项目...');
      }
      
      // 尝试模拟调用
      try {
        console.log('🎭 尝试模拟调用...');
        const simulationResult = await projectDebugger.simulateCreateProject(formData);
        console.log('✅ 模拟调用成功:', simulationResult);
      } catch (simulationError) {
        console.warn('⚠️ 模拟调用失败:', simulationError);
        console.log('继续尝试真实调用...');
      }
      
      console.log('📤 发送 createProject 交易...');
      
      const tx = await this.factoryContract.createProject(
        formData.name,
        formData.contractAddress,
        formData.website,
        formData.github,
        formData.apiDoc,
        formData.description,
        formData.category
      );

      console.log('📡 交易已发送，等待确认...');
      const receipt = await tx.wait();
      console.log('✅ 交易已确认:', receipt);
      
      // 使用调试器分析收据
      console.log('🔍 分析交易收据...');
      await projectDebugger.diagnoseTransactionReceipt(receipt);
      
      // 调试信息：检查 receipt 结构
      console.log('🔍 Receipt structure:', {
        events: receipt.events,
        logs: receipt.logs,
        status: receipt.status,
        blockNumber: receipt.blockNumber
      });
      
      // 方法 1: 查找 ProjectCreated 事件 (ethers v5 格式)
      let event = receipt.events?.find((e: any) => e.event === 'ProjectCreated');
      
      if (event && event.args) {
        console.log('✅ ProjectCreated event found (method 1):', event.args);
        console.log('🔍 Event args structure:', {
          projectId: event.args.projectId,
          projectAddress: event.args.projectAddress,
          projectIdType: typeof event.args.projectId,
          projectAddressType: typeof event.args.projectAddress
        });
        
        // 安全地获取 projectId
        const projectId = this.safeGetProjectId(event.args.projectId);
        const projectAddress = this.safeGetProjectAddress(event.args.projectAddress);
        
        return {
          projectId,
          projectAddress,
        };
      }

      // 方法 2: 查找 ProjectCreated 事件 (ethers v5 替代格式)
      event = receipt.events?.find((e: any) => e.eventName === 'ProjectCreated');
      
      if (event && event.args) {
        console.log('✅ ProjectCreated event found (method 2):', event.args);
        console.log('🔍 Event args structure:', {
          projectId: event.args.projectId,
          projectAddress: event.args.projectAddress,
          projectIdType: typeof event.args.projectId,
          projectAddressType: typeof event.args.projectAddress
        });
        
        // 安全地获取 projectId
        const projectId = this.safeGetProjectId(event.args.projectId);
        const projectAddress = this.safeGetProjectAddress(event.args.projectAddress);
        
        return {
          projectId,
          projectAddress,
        };
      }

      // 方法 3: 从交易日志中手动解析事件
      console.log('🔍 ProjectCreated event not found in events, checking logs...');
      const logs = receipt.logs;
      console.log('Transaction logs count:', logs.length);
      
      // 尝试手动解析事件
      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        console.log(`Analyzing log ${i + 1}:`, {
          address: log.address,
          topics: log.topics,
          data: log.data
        });
        
        try {
          // 检查是否是工厂合约的日志
          if (log.address.toLowerCase() === this.factoryContract.address.toLowerCase()) {
            const parsedLog = this.factoryContract.interface.parseLog(log);
            console.log(`✅ Parsed log ${i + 1}:`, {
              name: parsedLog.name,
              args: parsedLog.args
            });
            
            if (parsedLog.name === 'ProjectCreated' && parsedLog.args) {
              console.log('🎉 Found ProjectCreated event in logs!');
              console.log('🔍 Parsed args structure:', {
                projectId: parsedLog.args.projectId,
                projectAddress: parsedLog.args.projectAddress,
                projectIdType: typeof parsedLog.args.projectId,
                projectAddressType: typeof parsedLog.args.projectAddress
              });
              
              // 安全地获取 projectId
              const projectId = this.safeGetProjectId(parsedLog.args.projectId);
              const projectAddress = this.safeGetProjectAddress(parsedLog.args.projectAddress);
              
              return {
                projectId,
                projectAddress,
              };
            }
          }
        } catch (parseError) {
          console.log(`❌ Failed to parse log ${i + 1}:`, parseError);
        }
      }

      // 方法 4: 尝试从区块中获取事件
      console.log('🔍 Trying to get events from block...');
      try {
        const block = await this.signer.provider?.getBlock(receipt.blockNumber);
        console.log('Block info:', {
          number: block?.number,
          hash: block?.hash,
          timestamp: block?.timestamp
        });
        
        // 等待一下让事件索引完成
        console.log('⏳ Waiting for event indexing...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 重新尝试获取事件
        const events = await this.factoryContract.queryFilter(
          this.factoryContract.filters.ProjectCreated(),
          receipt.blockNumber,
          receipt.blockNumber
        );
        
        if (events.length > 0) {
          const latestEvent = events[events.length - 1];
          console.log('✅ Found ProjectCreated event from filter:', latestEvent.args);
          
          if (latestEvent.args) {
            console.log('🔍 Filter event args structure:', {
              projectId: latestEvent.args.projectId,
              projectAddress: latestEvent.args.projectAddress,
              projectIdType: typeof latestEvent.args.projectId,
              projectAddressType: typeof latestEvent.args.projectAddress
            });
            
            // 检查参数是否存在
            if (latestEvent.args.projectId === undefined || latestEvent.args.projectAddress === undefined) {
              console.error('❌ Event args are missing required fields:');
              console.error('- projectId:', latestEvent.args.projectId);
              console.error('- projectAddress:', latestEvent.args.projectAddress);
              console.error('Full event:', latestEvent);
              
              // 尝试从原始日志中解析
              console.log('🔍 Attempting to parse from raw logs...');
              const rawLogs = receipt.logs.filter((log: any) => log.topics[0] === this.factoryContract.interface.getEventTopic('ProjectCreated'));
              console.log('Raw logs for ProjectCreated:', rawLogs);
              
              throw new Error(
                'ProjectCreated event is missing required parameters. ' +
                'This usually indicates an ABI mismatch or contract deployment issue. ' +
                'Please verify the contract ABI matches the deployed contract.'
              );
            }
            
            // 安全地获取 projectId
            const projectId = this.safeGetProjectId(latestEvent.args.projectId);
            const projectAddress = this.safeGetProjectAddress(latestEvent.args.projectAddress);
            
            return {
              projectId,
              projectAddress,
            };
          } else {
            console.log('❌ Event args are undefined');
          }
        }
      } catch (filterError) {
        console.log('❌ Event filter failed:', filterError);
      }

      // 方法 5: 检查交易状态和 gas 使用情况
      console.log('🔍 Transaction analysis:');
      console.log('- Status:', receipt.status === 1 ? 'Success' : 'Failed');
      console.log('- Gas used:', receipt.gasUsed.toString());
      console.log('- Block number:', receipt.blockNumber);
      console.log('- Events count:', receipt.events?.length || 0);
      console.log('- Logs count:', receipt.logs.length);
      
      // 如果交易成功但没有找到事件，可能是合约问题
      if (receipt.status === 1) {
        console.error('❌ Transaction succeeded but ProjectCreated event not found');
        console.error('This could indicate:');
        console.error('1. Contract ABI mismatch');
        console.error('2. Event not properly emitted');
        console.error('3. Network indexing delay');
        console.error('4. Ethers version compatibility issue');
        
        // 抛出更详细的错误信息
        throw new Error(
          'Project creation transaction succeeded but ProjectCreated event not found. ' +
          'Please check contract deployment and ABI compatibility. ' +
          'Transaction hash: ' + receipt.transactionHash + ' ' +
          'This might be an ethers version compatibility issue.'
        );
      } else {
        throw new Error('Project creation transaction failed');
      }
      
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // 获取项目信息
  async getProjectInfo(projectAddress: string): Promise<ProjectInfo> {
    try {
      const projectContract = new ethers.Contract(projectAddress, DDProjectABI, this.signer);
      const info = await projectContract.getProjectInfo();

      return {
        name: info.name,
        contractAddress: info.contractAddress,
        website: info.website,
        github: info.github,
        apiDoc: info.apiDoc,
        description: info.description,
        category: info.category,
        createdAt: info.createdAt.toNumber(),
        creator: info.creator,
        isActive: info.isActive,
        currentVersion: info.currentVersion.toNumber(),
      };
    } catch (error) {
      console.error('Error fetching project info:', error);
      throw error;
    }
  }

  // 获取更新记录
  async getUpdateRecord(projectAddress: string, versionId: number): Promise<UpdateRecord> {
    try {
      const projectContract = new ethers.Contract(projectAddress, DDProjectABI, this.signer);
      const record = await projectContract.getUpdateRecord(versionId);

      return {
        versionId: record.versionId.toNumber(),
        timestamp: record.timestamp.toNumber(),
        name: record.name,
        contractAddress: record.contractAddress,
        website: record.website,
        github: record.github,
        apiDoc: record.apiDoc,
        description: record.description,
        category: record.category,
        updater: record.updater,
        stakeAmount: ethers.utils.formatEther(record.stakeAmount.toString()),
        isChallenged: record.isChallenged,
        challengeDeadline: record.challengeDeadline.toNumber(),
        updateReason: record.updateReason,
        isVerified: record.isVerified,
        isRolledBack: record.isRolledBack,
      };
    } catch (error) {
      console.error('Error fetching update record:', error);
      throw error;
    }
  }

  // 更新项目信息
  async updateProjectInfo(
    projectAddress: string,
    formData: UpdateProjectForm,
    stakeAmount: string
  ): Promise<number> {
    try {
      const projectContract = new ethers.Contract(projectAddress, DDProjectABI, this.signer);
      const stakeAmountWei = ethers.utils.parseEther(stakeAmount);

      const tx = await projectContract.updateProjectInfo(
        formData.name,
        formData.contractAddress,
        formData.website,
        formData.github,
        formData.apiDoc,
        formData.description,
        formData.category,
        formData.updateReason,
        { value: stakeAmountWei }
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === 'ProjectInfoUpdated');
      
      if (event) {
        return event.args.versionId.toNumber();
      }

      throw new Error('Update event not found');
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // 挑战更新
  async challengeUpdate(
    projectAddress: string,
    versionId: number,
    reason: string,
    stakeAmount: string
  ): Promise<void> {
    try {
      const projectContract = new ethers.Contract(projectAddress, DDProjectABI, this.signer);
      const stakeAmountWei = ethers.utils.parseEther(stakeAmount);

      const tx = await projectContract.challengeUpdate(versionId, reason, {
        value: stakeAmountWei,
      });

      await tx.wait();
    } catch (error) {
      console.error('Error challenging update:', error);
      throw error;
    }
  }

  // 安全地获取 projectId 的辅助函数
  private safeGetProjectId(projectIdArg: any): number {
    console.log('🔍 Safe get projectId - input:', projectIdArg);
    console.log('🔍 Input type:', typeof projectIdArg);
    console.log('🔍 Input constructor:', projectIdArg?.constructor?.name);
    
    try {
      // 处理 undefined 和 null 值
      if (projectIdArg === undefined || projectIdArg === null) {
        console.error('❌ projectId is undefined or null');
        throw new Error('ProjectId is undefined or null - this usually means the event was not properly emitted or there is an ABI mismatch');
      }
      
      // 如果是 BigNumber 或类似的大数类型
      if (projectIdArg && typeof projectIdArg.toNumber === 'function') {
        const result = projectIdArg.toNumber();
        console.log('✅ Converted from BigNumber:', result);
        return result;
      }
      
      // 如果是 BigInt
      if (typeof projectIdArg === 'bigint') {
        const result = Number(projectIdArg);
        console.log('✅ Converted from BigInt:', result);
        return result;
      }
      
      // 如果是字符串
      if (typeof projectIdArg === 'string') {
        // 移除 0x 前缀
        const cleanString = projectIdArg.startsWith('0x') ? projectIdArg.slice(2) : projectIdArg;
        const result = parseInt(cleanString, 16);
        if (!isNaN(result)) {
          console.log('✅ Converted from hex string:', result);
          return result;
        }
        // 尝试十进制解析
        const decimalResult = parseInt(projectIdArg, 10);
        if (!isNaN(decimalResult)) {
          console.log('✅ Converted from decimal string:', decimalResult);
          return decimalResult;
        }
      }
      
      // 如果是数字
      if (typeof projectIdArg === 'number') {
        if (Number.isInteger(projectIdArg)) {
          console.log('✅ Direct number:', projectIdArg);
          return projectIdArg;
        }
      }
      
      // 如果是对象，尝试获取 _hex 属性（ethers v5 的 BigNumber 格式）
      if (projectIdArg && typeof projectIdArg === 'object' && projectIdArg._hex) {
        const hexString = projectIdArg._hex;
        const result = parseInt(hexString.slice(2), 16);
        console.log('✅ Converted from _hex object:', result);
        return result;
      }
      
      // 如果是对象，尝试获取 toString 方法
      if (projectIdArg && typeof projectIdArg.toString === 'function') {
        const stringValue = projectIdArg.toString();
        const result = parseInt(stringValue, 10);
        if (!isNaN(result)) {
          console.log('✅ Converted from toString:', result);
          return result;
        }
      }
      
      console.error('❌ Cannot convert projectId:', projectIdArg);
      throw new Error(`Unsupported projectId format: ${typeof projectIdArg} - ${JSON.stringify(projectIdArg)}`);
      
    } catch (error) {
      console.error('❌ Error in safeGetProjectId:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to convert projectId: ${errorMessage}`);
    }
  }

  // 安全地获取 projectAddress 的辅助函数
  private safeGetProjectAddress(projectAddressArg: any): string {
    console.log('🔍 Safe get projectAddress - input:', projectAddressArg);
    
    try {
      // 处理 undefined 和 null 值
      if (projectAddressArg === undefined || projectAddressArg === null) {
        console.error('❌ projectAddress is undefined or null');
        throw new Error('ProjectAddress is undefined or null - this usually means the event was not properly emitted or there is an ABI mismatch');
      }
      
      if (typeof projectAddressArg === 'string') {
        return projectAddressArg;
      }
      
      if (projectAddressArg && typeof projectAddressArg.toString === 'function') {
        return projectAddressArg.toString();
      }
      
      throw new Error(`Unsupported projectAddress format: ${typeof projectAddressArg}`);
      
    } catch (error) {
      console.error('❌ Error in safeGetProjectAddress:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to convert projectAddress: ${errorMessage}`);
    }
  }
}
