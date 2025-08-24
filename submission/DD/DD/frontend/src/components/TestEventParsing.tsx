import React, { useState } from 'react';
import styled from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context';

const TestContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TestButton = styled.button`
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  margin: 10px 0;
  transition: background 0.2s ease;
  
  &:hover {
    background: #2c5aa0;
  }
  
  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
`;

const TestResult = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  
  pre {
    background: #2d3748;
    color: #e2e8f0;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 14px;
  }
`;

const TestEventParsing: React.FC = () => {
  const { provider, account } = useWeb3();
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testEventParsing = async () => {
    if (!provider || !account) {
      setTestResult({ error: '请先连接钱包' });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const signer = provider.getSigner();
      const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS || '0x342d20Fd89f54B386d8506FF5EB72059Fd0f79b7';
      
      // 测试不同的 projectId 格式
      const testCases = [
        { name: 'BigNumber 格式', value: { _hex: '0x01', _isBigNumber: true, toString: () => '1' } },
        { name: '字符串格式', value: '1' },
        { name: '数字格式', value: 1 },
        { name: '十六进制字符串', value: '0x01' },
        { name: 'BigInt 格式', value: BigInt(1) },
        { name: '对象格式', value: { toString: () => '1' } }
      ];

      const results = [];
      
      for (const testCase of testCases) {
        try {
          // 模拟事件参数
          const mockArgs = {
            projectId: testCase.value,
            projectAddress: '0x1234567890123456789012345678901234567890'
          };

          // 测试 safeGetProjectId 函数
          const projectId = safeGetProjectId(mockArgs.projectId);
          const projectAddress = safeGetProjectAddress(mockArgs.projectAddress);
          
          results.push({
            testCase: testCase.name,
            input: testCase.value,
            output: { projectId, projectAddress },
            success: true
          });
        } catch (error) {
          results.push({
            testCase: testCase.name,
            input: testCase.value,
            error: error instanceof Error ? error.message : String(error),
            success: false
          });
        }
      }

      setTestResult({
        message: '事件解析测试完成',
        results,
        summary: {
          total: results.length,
          success: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      });

    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 模拟 safeGetProjectId 函数（与 contractService 中的逻辑相同）
  const safeGetProjectId = (projectIdArg: any): number => {
    console.log('🔍 Safe get projectId - input:', projectIdArg);
    console.log('🔍 Input type:', typeof projectIdArg);
    console.log('🔍 Input constructor:', projectIdArg?.constructor?.name);
    
    try {
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
  };

  // 模拟 safeGetProjectAddress 函数
  const safeGetProjectAddress = (projectAddressArg: any): string => {
    console.log('🔍 Safe get projectAddress - input:', projectAddressArg);
    
    try {
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
  };

  return (
    <TestContainer>
      <h3>🧪 事件解析测试</h3>
      <p>测试修复后的事件解析功能，验证不同格式的 projectId 是否能正确转换：</p>
      
      <TestButton 
        onClick={testEventParsing}
        disabled={isLoading || !provider || !account}
      >
        {isLoading ? '🔄 测试中...' : '🔍 运行事件解析测试'}
      </TestButton>

      {testResult && (
        <TestResult>
          <h4>测试结果：</h4>
          {testResult.error ? (
            <div style={{ color: 'red' }}>❌ {testResult.error}</div>
          ) : (
            <div>
              <p><strong>{testResult.message}</strong></p>
              <p>总计: {testResult.summary.total} | 成功: {testResult.summary.success} | 失败: {testResult.summary.failed}</p>
              <h5>详细结果：</h5>
              <pre>{JSON.stringify(testResult.results, null, 2)}</pre>
            </div>
          )}
        </TestResult>
      )}
    </TestContainer>
  );
};

export default TestEventParsing;
