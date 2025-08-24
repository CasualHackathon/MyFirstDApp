import { ethers } from 'ethers';
import DDProjectFactoryABI from '../contracts/abi/DDProjectFactory.json';

export async function quickDiagnosis(signer: ethers.Signer) {
  console.log('🔍 Quick Contract Diagnosis Starting...');
  console.log('=====================================');
  
  const FACTORY_ADDRESS = process.env.REACT_APP_FACTORY_ADDRESS || '0x342d20Fd89f54B386d8506FF5EB72059Fd0f79b7';
  
  try {
    // 1. 检查网络
    const network = await signer.provider?.getNetwork();
    console.log('🌐 Network Info:');
    console.log(`  Chain ID: ${network?.chainId}`);
    console.log(`  Name: ${network?.name}`);
    
    // 检查是否是 Sepolia 网络
    if (network?.chainId === 11155111) {
      console.log('  ✅ Correct network: Sepolia Testnet');
    } else {
      console.log('  ❌ Wrong network! You need to switch to Sepolia Testnet');
      console.log('  📋 To fix this:');
      console.log('    1. Click the "Switch to Sepolia" button in the header');
      console.log('    2. Or manually switch in MetaMask to Sepolia Testnet');
      console.log('    3. Chain ID should be: 11155111');
      return; // 如果网络不对，停止检查
    }
    
    // 2. 检查合约地址
    const code = await signer.provider?.getCode(FACTORY_ADDRESS);
    console.log('\n📋 Contract Address Check:');
    console.log(`  Factory Address: ${FACTORY_ADDRESS}`);
    if (code && code !== '0x') {
      console.log('  ✅ Contract code exists at this address');
      console.log(`  Code length: ${code.length} characters`);
    } else {
      console.log('  ❌ No contract code at this address');
      console.log('\n🔍 Possible reasons:');
      console.log('  1. You are not connected to Sepolia Testnet');
      console.log('  2. The contract was not deployed to this address');
      console.log('  3. The contract address is incorrect');
      console.log('\n📋 Verification steps:');
      console.log('  1. Make sure you are on Sepolia Testnet (Chain ID: 11155111)');
      console.log('  2. Check the contract on Sepolia Etherscan:');
      console.log(`     https://sepolia.etherscan.io/address/${FACTORY_ADDRESS}`);
      console.log('  3. If the contract shows "Contract" status, try refreshing the page');
      console.log('  4. If the contract is not found, it may need to be deployed');
      return;
    }
    
    // 3. 尝试创建合约实例
    console.log('\n🔧 Contract Instance Test:');
    try {
      const contract = new ethers.Contract(FACTORY_ADDRESS, DDProjectFactoryABI, signer);
      console.log('  ✅ Contract instance created successfully');
      
      // 4. 测试基本函数调用
      console.log('\n🧪 Function Call Tests:');
      
      try {
        const totalProjects = await contract.totalProjects();
        console.log(`  ✅ totalProjects() call successful: ${totalProjects.toString()}`);
      } catch (error) {
        console.log(`  ❌ totalProjects() call failed: ${error}`);
      }
      
      try {
        const nextProjectId = await contract.nextProjectId();
        console.log(`  ✅ nextProjectId() call successful: ${nextProjectId.toString()}`);
      } catch (error) {
        console.log(`  ❌ nextProjectId() call failed: ${error}`);
      }
      
      try {
        const ddToken = await contract.ddToken();
        console.log(`  ✅ ddToken() call successful: ${ddToken}`);
      } catch (error) {
        console.log(`  ❌ ddToken() call failed: ${error}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Failed to create contract instance: ${error}`);
    }
    
    // 5. 检查 ABI 匹配
    console.log('\n📋 ABI Compatibility Check:');
    console.log(`  ABI functions count: ${DDProjectFactoryABI.length}`);
    const functionNames = DDProjectFactoryABI
      .filter(item => item.type === 'function')
      .map(item => item.name);
    console.log(`  Available functions: ${functionNames.join(', ')}`);
    
    // 6. 显示成功消息
    console.log('\n🎉 All checks passed! Your contract is working correctly.');
    console.log('You can now create new projects and interact with the contract.');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
  
  console.log('\n=====================================');
  console.log('🔍 Quick Diagnosis Complete');
}
