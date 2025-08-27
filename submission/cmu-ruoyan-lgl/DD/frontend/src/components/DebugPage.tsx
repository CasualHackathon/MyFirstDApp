import React, { useState } from 'react';
import styled from 'styled-components';
import CreateProjectDebuggerComponent from './CreateProjectDebugger';
import TestEventParsing from './TestEventParsing';
import { useWeb3 } from '../contexts/Web3Context';
import { ArrowLeft, Wifi, WifiOff, Wallet, Database, AlertTriangle } from 'lucide-react';

const DebugContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const DebugHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: #e2e8f0;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  transition: all 0.2s ease;
  
  &:hover {
    background: #cbd5e0;
    transform: translateY(-50%) translateX(-2px);
  }
`;

const DebugTitle = styled.h1`
  color: #2d3748;
  margin-bottom: 10px;
`;

const DebugSubtitle = styled.p`
  color: #718096;
  font-size: 18px;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  margin: 0 10px;
  border: none;
  background: ${props => props.active ? '#3182ce' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#3182ce' : '#f7fafc'};
  }
`;

const StatusCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3182ce;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatusItem = styled.div<{ status: 'success' | 'warning' | 'error' | 'info' }>`
  background: white;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'success': return '#48bb78';
      case 'warning': return '#ed8936';
      case 'error': return '#f56565';
      case 'info': return '#3182ce';
      default: return '#e2e8f0';
    }
  }};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatusIcon = styled.div<{ status: 'success' | 'warning' | 'error' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${props => {
    switch (props.status) {
      case 'success': return '#48bb78';
      case 'warning': return '#ed8936';
      case 'error': return '#f56565';
      case 'info': return '#3182ce';
      default: return '#4a5568';
    }
  }};
`;

const StatusValue = styled.div`
  font-size: 14px;
  color: #4a5568;
  word-break: break-all;
`;

const DebugPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { provider, account, chainId, isConnected, isCorrectNetwork } = useWeb3();
  const [activeTab, setActiveTab] = useState<'debugger' | 'info'>('debugger');

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 137: return 'Polygon';
      case 56: return 'BSC';
      default: return `Chain ID: ${chainId}`;
    }
  };

  const getNetworkStatus = () => {
    if (!isConnected) return { status: 'error' as const, text: '未连接钱包' };
    if (!isCorrectNetwork) return { status: 'warning' as const, text: '网络不匹配' };
    return { status: 'success' as const, text: '网络正常' };
  };

  const getWalletStatus = () => {
    if (!isConnected) return { status: 'error' as const, text: '未连接' };
    return { status: 'success' as const, text: '已连接' };
  };

  const getProviderStatus = () => {
    if (!provider) return { status: 'error' as const, text: '未初始化' };
    return { status: 'success' as const, text: '已初始化' };
  };

  return (
    <DebugContainer>
      <DebugHeader>
        <BackButton onClick={onBack}>
          <ArrowLeft size={16} />
          返回
        </BackButton>
        <DebugTitle>🔧 DD 项目调试中心</DebugTitle>
        <DebugSubtitle>诊断和解决项目创建问题</DebugSubtitle>
      </DebugHeader>

      <TabContainer>
        <Tab 
          active={activeTab === 'debugger'} 
          onClick={() => setActiveTab('debugger')}
        >
          🚀 项目创建调试
        </Tab>
        <Tab 
          active={activeTab === 'info'} 
          onClick={() => setActiveTab('info')}
        >
          📋 调试信息
        </Tab>
      </TabContainer>

      {activeTab === 'debugger' ? (
        <div>
          <StatusCard>
            <h3>🌐 网络状态监控</h3>
            <StatusGrid>
              <StatusItem status={getWalletStatus().status}>
                <StatusIcon status={getWalletStatus().status}>
                  <Wallet size={16} />
                  {getWalletStatus().text}
                </StatusIcon>
                <StatusValue>
                  {account ? `地址: ${account}` : '请连接钱包'}
                </StatusValue>
              </StatusItem>

              <StatusItem status={getNetworkStatus().status}>
                <StatusIcon status={getNetworkStatus().status}>
                  {isCorrectNetwork ? <Wifi size={16} /> : <WifiOff size={16} />}
                  {getNetworkStatus().text}
                </StatusIcon>
                <StatusValue>
                  {chainId ? `网络: ${getNetworkName(chainId)}` : '未知网络'}
                </StatusValue>
              </StatusItem>

              <StatusItem status={getProviderStatus().status}>
                <StatusIcon status={getProviderStatus().status}>
                  <Database size={16} />
                  {getProviderStatus().text}
                </StatusIcon>
                <StatusValue>
                  {provider ? 'Web3 提供者已就绪' : 'Web3 提供者未初始化'}
                </StatusValue>
              </StatusItem>
            </StatusGrid>
          </StatusCard>

          <CreateProjectDebuggerComponent />
          
          <TestEventParsing />
        </div>
      ) : (
        <div>
          <StatusCard>
            <h3>📋 调试工具说明</h3>
            <p>这个调试工具可以帮助你诊断和解决项目创建过程中的问题：</p>
            
            <h4>🔍 主要功能：</h4>
            <ul>
              <li><strong>合约连接诊断</strong> - 检查合约地址、网络和 ABI 兼容性</li>
              <li><strong>参数验证</strong> - 验证输入参数的类型和格式</li>
              <li><strong>模拟调用</strong> - 使用 callStatic 测试函数调用（不发送实际交易）</li>
              <li><strong>交易分析</strong> - 分析交易收据和事件</li>
            </ul>

            <h4>⚠️ 常见问题排查：</h4>
            <ul>
              <li><strong>合约连接失败</strong> - 检查合约地址和网络配置</li>
              <li><strong>ABI 不匹配</strong> - 确保使用正确的合约 ABI</li>
              <li><strong>参数格式错误</strong> - 验证输入参数的类型和长度</li>
              <li><strong>Gas 不足</strong> - 确保账户有足够的测试币</li>
            </ul>

            <h4>🎯 使用建议：</h4>
            <ul>
              <li>在发送实际交易前，先运行完整的预检查诊断</li>
              <li>使用模拟调用验证函数调用是否成功</li>
              <li>仔细查看控制台输出和错误信息</li>
              <li>如果问题持续，检查网络连接和合约状态</li>
            </ul>
          </StatusCard>
        </div>
      )}
    </DebugContainer>
  );
};

export default DebugPage;
