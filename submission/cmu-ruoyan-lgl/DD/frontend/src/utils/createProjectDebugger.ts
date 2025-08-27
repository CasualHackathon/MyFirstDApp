import { ethers } from 'ethers';
import DDProjectFactoryABI from '../contracts/abi/DDProjectFactory.json';

// 安全的地址验证函数，避免ENS解析
function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  
  // 检查长度
  if (address.length !== 42) return false;
  
  // 检查前缀
  if (!address.startsWith('0x')) return false;
  
  // 检查字符
  const validChars = /^[0-9a-fA-F]+$/;
  if (!validChars.test(address.slice(2))) return false;
  
  return true;
}

export class CreateProjectDebugger {
  private factoryContract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(signer: ethers.Signer, factoryAddress: string) {
    this.signer = signer;
    this.factoryContract = new ethers.Contract(factoryAddress, DDProjectFactoryABI, signer);
  }

  // 诊断合约连接
  async diagnoseContractConnection() {
    console.log('🔍 === 合约连接诊断 ===');
    
    try {
      // 检查合约地址
      console.log('📍 合约地址:', this.factoryContract.address);
      
      // 检查网络
      const network = await this.signer.provider?.getNetwork();
      console.log('🌐 网络信息:', network);
      
      // 检查签名者地址
      const signerAddress = await this.signer.getAddress();
      console.log('👤 签名者地址:', signerAddress);
      
      // 检查合约代码
      const code = await this.signer.provider?.getCode(this.factoryContract.address);
      console.log('📄 合约代码长度:', code?.length || 0);
      
      if (code === '0x') {
        console.error('❌ 合约地址上没有代码！');
        return false;
      }
      
      // 检查 ABI 兼容性
      try {
        const createProjectFragment = this.factoryContract.interface.getFunction('createProject');
        console.log('✅ createProject 函数 ABI 正常');
        console.log('📋 函数签名:', createProjectFragment.format());
        console.log('📥 输入参数:', createProjectFragment.inputs);
        console.log('📤 输出参数:', createProjectFragment.outputs);
      } catch (error) {
        console.error('❌ createProject 函数 ABI 错误:', error);
        return false;
      }
      
      // 检查事件 ABI
      try {
        const projectCreatedFragment = this.factoryContract.interface.getEvent('ProjectCreated');
        console.log('✅ ProjectCreated 事件 ABI 正常');
        console.log('📋 事件签名:', projectCreatedFragment.format());
        console.log('📥 事件参数:', projectCreatedFragment.inputs);
      } catch (error) {
        console.error('❌ ProjectCreated 事件 ABI 错误:', error);
        return false;
      }
      
      console.log('✅ 合约连接诊断完成');
      return true;
      
    } catch (error) {
      console.error('❌ 合约连接诊断失败:', error);
      return false;
    }
  }

  // 诊断 createProject 调用
  async diagnoseCreateProjectCall(formData: any) {
    console.log('🔍 === createProject 调用诊断 ===');
    
    try {
      // 检查输入参数
      console.log('📥 输入参数:', {
        name: formData.name,
        contractAddress: formData.contractAddress,
        website: formData.website,
        github: formData.github,
        apiDoc: formData.apiDoc,
        description: formData.description,
        category: formData.category
      });
      
      // 检查参数类型
      console.log('🔍 参数类型检查:');
      console.log('- name:', typeof formData.name, '长度:', formData.name?.length);
      console.log('- contractAddress:', typeof formData.contractAddress, '有效地址:', isValidAddress(formData.contractAddress));
      console.log('- website:', typeof formData.website, '长度:', formData.website?.length);
      console.log('- github:', typeof formData.github, '长度:', formData.github?.length);
      console.log('- apiDoc:', typeof formData.apiDoc, '长度:', formData.apiDoc?.length);
      console.log('- description:', typeof formData.description, '长度:', formData.description?.length);
      console.log('- category:', typeof formData.category, '长度:', formData.category?.length);
      
      // 检查 gas 估算
      try {
        const gasEstimate = await this.factoryContract.estimateGas.createProject(
          formData.name,
          formData.contractAddress,
          formData.website,
          formData.github,
          formData.apiDoc,
          formData.description,
          formData.category
        );
        console.log('⛽ Gas 估算:', gasEstimate.toString());
      } catch (error) {
        console.error('❌ Gas 估算失败:', error);
        return false;
      }
      
      console.log('✅ createProject 调用诊断完成');
      return true;
      
    } catch (error) {
      console.error('❌ createProject 调用诊断失败:', error);
      return false;
    }
  }

  // 诊断交易收据
  async diagnoseTransactionReceipt(receipt: any) {
    console.log('🔍 === 交易收据诊断 ===');
    
    try {
      console.log('📋 收据基本信息:', {
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed?.toString(),
        eventsCount: receipt.events?.length || 0,
        logsCount: receipt.logs?.length || 0
      });
      
      // 检查事件
      if (receipt.events && receipt.events.length > 0) {
        console.log('📢 事件列表:');
        receipt.events.forEach((event: any, index: number) => {
          console.log(`  ${index + 1}. 事件名: ${event.event || event.eventName || 'Unknown'}`);
          console.log(`     参数:`, event.args);
          console.log(`     类型:`, typeof event.args);
        });
      } else {
        console.log('⚠️ 没有找到事件');
      }
      
      // 检查日志
      if (receipt.logs && receipt.logs.length > 0) {
        console.log('📝 日志列表:');
        receipt.logs.forEach((log: any, index: number) => {
          console.log(`  ${index + 1}. 地址: ${log.address}`);
          console.log(`     Topics:`, log.topics);
          console.log(`     Data:`, log.data);
        });
      } else {
        console.log('⚠️ 没有找到日志');
      }
      
      // 尝试解析日志
      if (receipt.logs && receipt.logs.length > 0) {
        console.log('🔍 尝试解析日志...');
        for (let i = 0; i < receipt.logs.length; i++) {
          const log = receipt.logs[i];
          try {
            if (log.address.toLowerCase() === this.factoryContract.address.toLowerCase()) {
              const parsedLog = this.factoryContract.interface.parseLog(log);
              console.log(`✅ 成功解析日志 ${i + 1}:`, {
                name: parsedLog.name,
                args: parsedLog.args
              });
            }
          } catch (parseError) {
            console.log(`❌ 解析日志 ${i + 1} 失败:`, parseError);
          }
        }
      }
      
      console.log('✅ 交易收据诊断完成');
      return true;
      
    } catch (error) {
      console.error('❌ 交易收据诊断失败:', error);
      return false;
    }
  }

  // 完整诊断流程
  async fullDiagnosis(formData: any) {
    console.log('🚀 === 开始完整诊断 ===');
    
    // 步骤 1: 合约连接诊断
    const connectionOk = await this.diagnoseContractConnection();
    if (!connectionOk) {
      console.error('❌ 合约连接诊断失败，停止诊断');
      return false;
    }
    
    // 步骤 2: createProject 调用诊断
    const callOk = await this.diagnoseCreateProjectCall(formData);
    if (!callOk) {
      console.error('❌ createProject 调用诊断失败，停止诊断');
      return false;
    }
    
    console.log('✅ 完整诊断完成，可以尝试创建项目');
    return true;
  }

  // 模拟 createProject 调用（不发送交易）
  async simulateCreateProject(formData: any) {
    console.log('🎭 === 模拟 createProject 调用 ===');
    
    try {
      // 使用 callStatic 模拟调用
      const result = await this.factoryContract.callStatic.createProject(
        formData.name,
        formData.contractAddress,
        formData.website,
        formData.github,
        formData.apiDoc,
        formData.description,
        formData.category
      );
      
      console.log('✅ 模拟调用成功:', result);
      console.log('📊 返回结果类型:', {
        projectId: typeof result.projectId,
        projectAddress: typeof result.projectAddress
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ 模拟调用失败:', error);
      throw error;
    }
  }
}
