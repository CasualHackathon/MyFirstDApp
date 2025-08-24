import React, { useState } from 'react';
import styled from 'styled-components';
import { BookOpen, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';

const GuideContainer = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const GuideHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0c4a6e;
  font-weight: 600;
  margin-bottom: 1rem;
  cursor: pointer;
  user-select: none;
`;

const StepContainer = styled.div<{ isExpanded: boolean }>`
  margin-bottom: 1rem;
  border-left: 3px solid #0ea5e9;
  padding-left: 1rem;
`;

const StepHeader = styled.div<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0c4a6e;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  margin-bottom: ${props => props.isExpanded ? '0.5rem' : '0'};
`;

const StepContent = styled.div<{ isExpanded: boolean }>`
  display: ${props => props.isExpanded ? 'block' : 'none'};
  color: #0c4a6e;
  line-height: 1.6;
  margin-left: 1.5rem;
`;

const StepList = styled.ol`
  margin: 0.5rem 0;
  padding-left: 1.5rem;
`;

const StepItem = styled.li`
  margin-bottom: 0.5rem;
  line-height: 1.5;
`;

const StatusIcon = styled.div<{ isCompleted: boolean }>`
  color: ${props => props.isCompleted ? '#059669' : '#6b7280'};
`;

const ActionButton = styled.button`
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  
  &:hover {
    background: #0284c7;
  }
  
  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
  }
`;

const QuickStartGuide: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const { isConnected, isCorrectNetwork, connect, switchToSepolia } = useWeb3();

  const toggleStep = (stepIndex: number) => {
    setExpandedSteps(prev => 
      prev.includes(stepIndex) 
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const steps = [
    {
      title: '安装 MetaMask',
      content: '确保你的浏览器已安装 MetaMask 扩展程序。如果没有，请从 Chrome 网上应用店或 Firefox 附加组件商店下载。',
      isCompleted: typeof window.ethereum !== 'undefined'
    },
    {
      title: '连接钱包',
      content: '点击页面上的 "Connect Wallet" 按钮，授权 MetaMask 连接到此应用。',
      isCompleted: isConnected
    },
    {
      title: '切换到 Sepolia 测试网',
      content: '确保你连接的是 Sepolia 测试网 (Chain ID: 11155111)。如果不在正确的网络，MetaMask 会提示你切换。',
      isCompleted: isCorrectNetwork
    },
    {
      title: '获取测试 ETH',
      content: '在 Sepolia 测试网上，你需要一些测试 ETH 来支付 gas 费。可以从 Sepolia 水龙头获取免费的测试 ETH。',
      isCompleted: false // 无法自动检测
    },
    {
      title: '开始使用',
      content: '现在你可以创建新项目、查看项目列表，并使用所有功能了！',
      isCompleted: isConnected && isCorrectNetwork
    }
  ];

  const getStepStatus = (step: any, index: number) => {
    if (step.isCompleted) {
      return <CheckCircle size={16} />;
    }
    if (index === 1 && !isConnected) {
      return <ActionButton onClick={connect}>连接钱包</ActionButton>;
    }
    if (index === 2 && isConnected && !isCorrectNetwork) {
      return <ActionButton onClick={switchToSepolia}>切换到 Sepolia</ActionButton>;
    }
    return <XCircle size={16} />;
  };

  return (
    <GuideContainer>
      <GuideHeader onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        <BookOpen size={20} />
        快速启动指南
      </GuideHeader>
      
      {isExpanded && (
        <div>
          {steps.map((step, index) => (
            <StepContainer key={index} isExpanded={expandedSteps.includes(index)}>
              <StepHeader 
                isExpanded={expandedSteps.includes(index)}
                onClick={() => toggleStep(index)}
              >
                {expandedSteps.includes(index) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <StatusIcon isCompleted={step.isCompleted}>
                  {getStepStatus(step, index)}
                </StatusIcon>
                {step.title}
              </StepHeader>
              
              <StepContent isExpanded={expandedSteps.includes(index)}>
                <p>{step.content}</p>
                
                {index === 3 && (
                  <div>
                    <p><strong>获取测试 ETH 的步骤：</strong></p>
                    <StepList>
                      <StepItem>访问 Sepolia 水龙头网站</StepItem>
                      <StepItem>输入你的钱包地址</StepItem>
                      <StepItem>等待几分钟接收测试 ETH</StepItem>
                      <StepItem>确认 MetaMask 中显示测试 ETH</StepItem>
                    </StepList>
                    <a 
                      href="https://sepoliafaucet.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#0ea5e9', textDecoration: 'underline' }}
                    >
                      访问 Sepolia 水龙头 →
                    </a>
                  </div>
                )}
              </StepContent>
            </StepContainer>
          ))}
        </div>
      )}
    </GuideContainer>
  );
};

export default QuickStartGuide;
