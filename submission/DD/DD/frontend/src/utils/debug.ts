import { ethers } from 'ethers';
import DDProjectFactoryABI from '../contracts/abi/DDProjectFactory.json';

// 合约地址
const FACTORY_ADDRESS = process.env.REACT_APP_FACTORY_ADDRESS || '0x342d20Fd89f54B386d8506FF5EB72059Fd0f79b7';

export const debugContract = async (signer: ethers.Signer) => {
  try {
    console.log('=== Debug Contract Connection ===');
    
    if (!signer.provider) {
      console.error('❌ No provider available');
      return;
    }

    // 检查网络
    const network = await signer.provider.getNetwork();
    console.log('🌐 Current Network:', {
      name: network.name,
      chainId: network.chainId,
      isSepolia: network.chainId === 11155111
    });

    // 检查钱包地址
    const address = await signer.getAddress();
    console.log('👛 Wallet Address:', address);

    // 检查余额
    const balance = await signer.provider.getBalance(address);
    console.log('💰 ETH Balance:', ethers.utils.formatEther(balance), 'ETH');

    // 检查工厂合约
    const factoryContract = new ethers.Contract(FACTORY_ADDRESS, DDProjectFactoryABI, signer);
    
    try {
      const totalProjects = await factoryContract.totalProjects();
      console.log('✅ Factory Contract Total Projects:', totalProjects.toString());
    } catch (error) {
      console.error('❌ Factory Contract Error:', error);
    }

    // 检查合约代码
    const code = await signer.provider.getCode(FACTORY_ADDRESS);
    console.log('📄 Contract Code Length:', code.length);
    console.log('📄 Contract Code (first 100 chars):', code.substring(0, 100));

    console.log('=== Debug Complete ===');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

export const testCreateProject = async (signer: ethers.Signer) => {
  try {
    console.log('=== Test Create Project ===');
    
    const factoryContract = new ethers.Contract(FACTORY_ADDRESS, DDProjectFactoryABI, signer);
    
    // 测试数据
    const testData = {
      name: 'Test Project',
      contractAddress: '0x1234567890123456789012345678901234567890',
      website: 'https://test.com',
      github: 'https://github.com/test',
      apiDoc: 'https://docs.test.com',
      description: 'Test project description',
      category: 'Test'
    };
    
    console.log('Test data:', testData);
    
    // 估算 gas
    try {
      const gasEstimate = await factoryContract.estimateGas.createProject(
        testData.name,
        testData.contractAddress,
        testData.website,
        testData.github,
        testData.apiDoc,
        testData.description,
        testData.category
      );
      
      console.log('✅ Gas estimate:', gasEstimate.toString());
    } catch (error) {
      console.error('❌ Gas estimation failed:', error);
    }
    
    console.log('=== Test Complete ===');
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

export const checkNetwork = async (signer: ethers.Signer) => {
  try {
    console.log('=== Network Check ===');
    
    if (!signer.provider) {
      console.error('❌ No provider available');
      return false;
    }

    const network = await signer.provider.getNetwork();
    const isCorrect = network.chainId === 11155111;
    
    console.log('🌐 Network Info:', {
      name: network.name,
      chainId: network.chainId,
      isCorrect,
      expectedChainId: 11155111
    });

    if (!isCorrect) {
      console.error('❌ Wrong network! Please switch to Sepolia Testnet');
      console.log('📋 To switch networks:');
      console.log('1. Open MetaMask');
      console.log('2. Click network selector');
      console.log('3. Select "Add Network" or "Switch Network"');
      console.log('4. Add Sepolia:');
      console.log('   - Network Name: Sepolia Testnet');
      console.log('   - RPC URL: https://sepolia.infura.io/v3/67d1669f03194a7ca5b5b74589c18c2d');
      console.log('   - Chain ID: 11155111');
      console.log('   - Currency Symbol: SEP');
      console.log('   - Block Explorer: https://sepolia.etherscan.io/');
    } else {
      console.log('✅ Correct network (Sepolia Testnet)');
    }

    return isCorrect;
  } catch (error) {
    console.error('Network check error:', error);
    return false;
  }
};

export const analyzeTransaction = async (signer: ethers.Signer, txHash: string) => {
  try {
    console.log('=== Transaction Analysis ===');
    
    if (!signer.provider) {
      console.error('❌ No provider available');
      return;
    }

    // 获取交易详情
    const tx = await signer.provider.getTransaction(txHash);
    const receipt = await signer.provider.getTransactionReceipt(txHash);
    
    console.log('📋 Transaction Details:', {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: ethers.utils.formatEther(tx.value || 0),
      gasLimit: tx.gasLimit?.toString(),
      gasPrice: tx.gasPrice ? ethers.utils.formatUnits(tx.gasPrice, 'gwei') + ' gwei' : 'N/A'
    });

    console.log('📋 Transaction Receipt:', {
      status: receipt?.status === 1 ? '✅ Success' : '❌ Failed',
      gasUsed: receipt?.gasUsed?.toString(),
      effectiveGasPrice: receipt?.effectiveGasPrice ? ethers.utils.formatUnits(receipt.effectiveGasPrice, 'gwei') + ' gwei' : 'N/A',
      blockNumber: receipt?.blockNumber,
      events: receipt?.logs?.length || 0
    });

    // 检查是否是工厂合约调用
    if (tx.to?.toLowerCase() === FACTORY_ADDRESS.toLowerCase()) {
      console.log('✅ Transaction sent to correct factory contract');
      
      // 尝试解析输入数据
      if (tx.data && tx.data !== '0x') {
        try {
          const factoryContract = new ethers.Contract(FACTORY_ADDRESS, DDProjectFactoryABI, signer);
          const decodedData = factoryContract.interface.parseTransaction({ data: tx.data });
          console.log('🔍 Decoded Function Call:', {
            name: decodedData.name,
            args: decodedData.args
          });
        } catch (error) {
          console.log('❌ Could not decode transaction data:', error);
        }
      }
    } else {
      console.error('❌ Transaction NOT sent to factory contract!');
      console.log('Expected:', FACTORY_ADDRESS);
      console.log('Actual:', tx.to);
    }

    // 分析事件日志
    if (receipt?.logs && receipt.logs.length > 0) {
      console.log('📊 Event Logs Analysis:');
      
      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        console.log(`Log ${i + 1}:`, {
          address: log.address,
          topics: log.topics,
          data: log.data
        });
        
        // 尝试解析 ProjectCreated 事件
        if (log.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase()) {
          try {
            const factoryContract = new ethers.Contract(FACTORY_ADDRESS, DDProjectFactoryABI, signer);
            const parsedLog = factoryContract.interface.parseLog(log);
            console.log(`✅ Parsed Event:`, {
              name: parsedLog.name,
              args: parsedLog.args
            });
          } catch (error) {
            // 忽略解析错误
          }
        }
      }
    }

    console.log('=== Analysis Complete ===');
    
  } catch (error) {
    console.error('Transaction analysis error:', error);
  }
};

export const verifyContractDeployment = async (signer: ethers.Signer) => {
  try {
    console.log('=== Contract Deployment Verification ===');
    
    if (!signer.provider) {
      console.error('❌ No provider available');
      return;
    }

    // 检查工厂合约
    const factoryCode = await signer.provider.getCode(FACTORY_ADDRESS);
    console.log('🏭 Factory Contract:', {
      address: FACTORY_ADDRESS,
      hasCode: factoryCode !== '0x',
      codeLength: factoryCode.length
    });

    if (factoryCode === '0x') {
      console.error('❌ Factory contract not deployed or wrong address!');
      return;
    }

    // 检查 DDToken 合约
    const factoryContract = new ethers.Contract(FACTORY_ADDRESS, DDProjectFactoryABI, signer);
    try {
      const ddTokenAddress = await factoryContract.ddToken();
      const tokenCode = await signer.provider.getCode(ddTokenAddress);
      
      console.log('🪙 DDToken Contract:', {
        address: ddTokenAddress,
        hasCode: tokenCode !== '0x',
        codeLength: tokenCode.length
      });
    } catch (error) {
      console.error('❌ Could not get DDToken address:', error);
    }

    console.log('=== Verification Complete ===');
    
  } catch (error) {
    console.error('Verification error:', error);
  }
};

export const debugProjectCreation = async (signer: ethers.Signer, txHash: string) => {
  try {
    console.log('=== Debug Project Creation ===');
    
    if (!signer.provider) {
      console.error('❌ No provider available');
      return;
    }

    const factoryContract = new ethers.Contract(FACTORY_ADDRESS, DDProjectFactoryABI, signer);
    
    // 获取交易详情
    const tx = await signer.provider.getTransaction(txHash);
    const receipt = await signer.provider.getTransactionReceipt(txHash);
    
    console.log('📋 Transaction Info:', {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      status: receipt?.status === 1 ? '✅ Success' : '❌ Failed',
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed?.toString()
    });

    // 检查是否是工厂合约调用
    if (tx.to?.toLowerCase() !== FACTORY_ADDRESS.toLowerCase()) {
      console.error('❌ Transaction NOT sent to factory contract!');
      console.log('Expected:', FACTORY_ADDRESS);
      console.log('Actual:', tx.to);
      return;
    }

    console.log('✅ Transaction sent to correct factory contract');

    // 解析输入数据
    if (tx.data && tx.data !== '0x') {
      try {
        const decodedData = factoryContract.interface.parseTransaction({ data: tx.data });
        console.log('🔍 Decoded Function Call:', {
          name: decodedData.name,
          args: decodedData.args
        });
        
        if (decodedData.name !== 'createProject') {
          console.error('❌ Wrong function called! Expected: createProject, Got:', decodedData.name);
          return;
        }
      } catch (error) {
        console.error('❌ Could not decode transaction data:', error);
        return;
      }
    }

    // 分析事件日志
    console.log('📊 Event Logs Analysis:');
    if (receipt?.logs && receipt.logs.length > 0) {
      console.log(`Found ${receipt.logs.length} log entries`);
      
      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        console.log(`\n--- Log ${i + 1} ---`);
        console.log('Address:', log.address);
        console.log('Topics:', log.topics);
        console.log('Data:', log.data);
        
        // 尝试解析日志
        try {
          if (log.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase()) {
            const parsedLog = factoryContract.interface.parseLog(log);
            console.log('✅ Parsed Successfully:', {
              name: parsedLog.name,
              args: parsedLog.args
            });
            
            if (parsedLog.name === 'ProjectCreated') {
              console.log('🎉 FOUND ProjectCreated EVENT!');
              console.log('Project ID:', parsedLog.args.projectId.toString());
              console.log('Project Address:', parsedLog.args.projectAddress);
              return;
            }
          } else {
            console.log('⚠️ Not from factory contract');
          }
        } catch (parseError) {
          console.log('❌ Parse failed:', parseError);
        }
      }
    } else {
      console.log('❌ No logs found in transaction');
    }

    // 尝试从区块中查询事件
    console.log('\n🔍 Querying events from block...');
    try {
      const events = await factoryContract.queryFilter(
        factoryContract.filters.ProjectCreated(),
        receipt.blockNumber,
        receipt.blockNumber
      );
      
      console.log(`Found ${events.length} ProjectCreated events in block ${receipt.blockNumber}`);
      
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        console.log(`Event ${i + 1}:`, {
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          args: event.args
        });
        
        if (event.transactionHash === txHash) {
          console.log('🎉 FOUND ProjectCreated EVENT for this transaction!');
          if (event.args) {
            console.log('Project ID:', event.args.projectId.toString());
            console.log('Project Address:', event.args.projectAddress);
            return;
          }
        }
      }
    } catch (error) {
      console.log('❌ Event query failed:', error);
    }

    // 检查合约状态
    console.log('\n🔍 Checking contract state...');
    try {
      const totalProjects = await factoryContract.totalProjects();
      console.log('Total projects in factory:', totalProjects.toString());
      
      // 检查用户项目
      const userAddress = await signer.getAddress();
      const userProjects = await factoryContract.getUserProjects(userAddress);
      console.log('User projects count:', userProjects.length);
      
      if (userProjects.length > 0) {
        const latestProjectId = userProjects[userProjects.length - 1];
        const projectAddress = await factoryContract.projects(latestProjectId);
        console.log('Latest project ID:', latestProjectId.toString());
        console.log('Latest project address:', projectAddress);
      }
    } catch (error) {
      console.log('❌ Contract state check failed:', error);
    }

    console.log('\n❌ ProjectCreated event not found');
    console.log('Possible causes:');
    console.log('1. Event not emitted by contract');
    console.log('2. ABI mismatch');
    console.log('3. Contract deployment issue');
    console.log('4. Network indexing delay');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

// 新增：合约状态诊断功能
export const diagnoseContractState = async (signer: ethers.Signer) => {
  try {
    console.log('🔍 Starting Contract State Diagnosis...');
    console.log('=====================================');
    
    if (!signer.provider) {
      console.error('❌ No provider available');
      return;
    }

    // 1. 检查网络连接
    const network = await signer.provider.getNetwork();
    console.log('🌐 Network Info:');
    console.log('  Chain ID:', network.chainId);
    console.log('  Name:', network.name);
    
    // 2. 检查合约地址是否存在
    console.log('\n📋 Contract Address Check:');
    console.log('  Factory Address:', FACTORY_ADDRESS);
    
    const factoryCode = await signer.provider.getCode(FACTORY_ADDRESS);
    console.log('  Factory Contract Code Length:', factoryCode.length);
    
    if (factoryCode === '0x') {
      console.log('  ❌ Factory contract does not exist at this address!');
      console.log('  This means the contract was never deployed or the address is wrong.');
      return false;
    }
    
    console.log('  ✅ Factory contract exists at this address');
    
    // 3. 尝试调用合约函数
    console.log('\n🔧 Contract Function Test:');
    
    const factoryContract = new ethers.Contract(FACTORY_ADDRESS, DDProjectFactoryABI, signer);
    
    try {
      const totalProjects = await factoryContract.totalProjects();
      console.log('  ✅ totalProjects() call successful:', totalProjects.toString());
    } catch (error: any) {
      console.log('  ❌ totalProjects() call failed:', error.message);
      console.log('  Error details:', error);
    }
    
    try {
      const nextProjectId = await factoryContract.nextProjectId();
      console.log('  ✅ nextProjectId() call successful:', nextProjectId.toString());
    } catch (error: any) {
      console.log('  ❌ nextProjectId() call failed:', error.message);
    }
    
    // 4. 检查事件签名
    console.log('\n📝 Event Signature Check:');
    try {
      const eventFragment = factoryContract.interface.getEvent('ProjectCreated');
      console.log('  ✅ ProjectCreated event found in ABI');
      console.log('  Event signature:', eventFragment.format());
    } catch (error: any) {
      console.log('  ❌ ProjectCreated event not found in ABI:', error.message);
    }
    
    // 5. 检查最近的区块
    console.log('\n📦 Recent Block Check:');
    const latestBlock = await signer.provider.getBlockNumber();
    console.log('  Latest block number:', latestBlock);
    
    // 6. 检查合约创建者
    console.log('\n👤 Contract Creator Check:');
    try {
      const txCount = await signer.provider.getTransactionCount(FACTORY_ADDRESS);
      console.log('  Factory contract transaction count:', txCount);
    } catch (error: any) {
      console.log('  ❌ Could not get transaction count:', error.message);
    }
    
    return true;
    
  } catch (error: any) {
    console.error('❌ Diagnosis failed:', error);
    return false;
  }
};


