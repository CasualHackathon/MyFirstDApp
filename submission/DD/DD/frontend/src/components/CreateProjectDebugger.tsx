import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { CreateProjectDebugger } from '../utils/createProjectDebugger';
import { CreateProjectForm } from '../types';

const CreateProjectDebuggerComponent: React.FC = () => {
  const { provider, account } = useWeb3();
  const [diagnosticResult, setDiagnosticResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleFormData: CreateProjectForm = {
    name: 'Test Project',
    contractAddress: '0x1234567890123456789012345678901234567890',
    website: 'https://example.com',
    github: 'https://github.com/example',
    apiDoc: 'https://docs.example.com',
    description: 'This is a test project for debugging',
    category: 'DeFi'
  };

  const runDiagnostics = async () => {
    if (!provider || !account) {
      setDiagnosticResult('❌ 请先连接钱包');
      return;
    }

    setIsLoading(true);
    setDiagnosticResult('🔍 正在运行诊断...\n');

    try {
      const signer = provider.getSigner();
      const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS || '0x342d20Fd89f54B386d8506FF5EB72059Fd0f79b7';
      
      const projectDebugger = new CreateProjectDebugger(signer, factoryAddress);
      
      // 捕获控制台输出
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      
      let output = '';
      console.log = (...args) => {
        output += args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
        originalLog(...args);
      };
      
      console.warn = (...args) => {
        output += '⚠️ ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
        originalWarn(...args);
      };
      
      console.error = (...args) => {
        output += '❌ ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
        originalError(...args);
      };

      try {
        // 运行完整诊断
        await projectDebugger.fullDiagnosis(sampleFormData);
        
        // 尝试模拟调用
        await projectDebugger.simulateCreateProject(sampleFormData);
        
        output += '\n✅ 诊断完成！\n';
        
      } catch (error) {
        output += `\n❌ 诊断过程中出现错误: ${error}\n`;
      }

      // 恢复原始控制台方法
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;

      setDiagnosticResult(output);
      
    } catch (error) {
      setDiagnosticResult(`❌ 诊断失败: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setDiagnosticResult('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔧 CreateProject 调试工具</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p>这个工具可以帮助诊断 createProject 的问题：</p>
        <ul>
          <li>检查合约连接状态</li>
          <li>验证 ABI 兼容性</li>
          <li>测试参数格式</li>
          <li>模拟函数调用</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>📋 测试数据</h3>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          {JSON.stringify(sampleFormData, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runDiagnostics}
          disabled={isLoading || !provider || !account}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '🔍 诊断中...' : '🚀 运行诊断'}
        </button>
        
        <button 
          onClick={clearResults}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          🗑️ 清除结果
        </button>
      </div>

      {!provider && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          ⚠️ 请先连接钱包
        </div>
      )}

      {diagnosticResult && (
        <div>
          <h3>📊 诊断结果</h3>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #dee2e6',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            maxHeight: '500px',
            overflow: 'auto'
          }}>
            {diagnosticResult}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CreateProjectDebuggerComponent;
