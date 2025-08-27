import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, HelpCircle, ExternalLink } from 'lucide-react';

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: #7f1d1d;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const SolutionList = styled.ul`
  color: #7f1d1d;
  margin: 0.5rem 0;
  padding-left: 1.5rem;
`;

const SolutionItem = styled.li`
  margin-bottom: 0.5rem;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  
  &:hover {
    background: #b91c1c;
  }
`;

const HelpLink = styled.a`
  color: #dc2626;
  text-decoration: underline;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  
  &:hover {
    color: #b91c1c;
  }
`;

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  const isContractError = error.includes('CALL_EXCEPTION') || error.includes('call revert');
  const isNetworkError = error.includes('network') || error.includes('Network');
  const isGasError = error.includes('gas') || error.includes('Gas');

  const getErrorType = () => {
    if (isContractError) return 'Contract Call Error';
    if (isNetworkError) return 'Network Connection Error';
    if (isGasError) return 'Gas Estimation Error';
    return 'Unknown Error';
  };

  const getSolutions = () => {
    if (isContractError) {
      return [
        '确保你连接的是 Sepolia 测试网 (Chain ID: 11155111)',
        '检查 MetaMask 是否已连接并解锁',
        `确保合约地址正确: ${process.env.REACT_APP_FACTORY_ADDRESS || '0x342d20Fd89f54B386d8506FF5EB72059Fd0f79b7'}`,
        '尝试刷新页面并重新连接钱包'
      ];
    }
    
    if (isNetworkError) {
      return [
        '切换到 Sepolia 测试网',
        '检查网络连接是否正常',
        '确保 MetaMask 网络设置正确',
        '尝试重新连接钱包'
      ];
    }
    
    if (isGasError) {
      return [
        '检查账户是否有足够的 ETH 支付 gas 费',
        '尝试调整 gas 限制',
        '检查网络拥堵情况',
        '稍后重试'
      ];
    }
    
    return [
      '刷新页面',
      '重新连接钱包',
      '检查控制台错误信息',
      '联系技术支持'
    ];
  };

  return (
    <ErrorContainer>
      <ErrorHeader>
        <AlertTriangle size={20} />
        {getErrorType()}
      </ErrorHeader>
      
      <ErrorMessage>
        <strong>错误详情:</strong> {error}
      </ErrorMessage>
      
      <div>
        <strong>可能的解决方案:</strong>
        <SolutionList>
          {getSolutions().map((solution, index) => (
            <SolutionItem key={index}>{solution}</SolutionItem>
          ))}
        </SolutionList>
      </div>
      
      {onRetry && (
        <ActionButton onClick={onRetry}>
          <HelpCircle size={16} />
          重试
        </ActionButton>
      )}
      
      <HelpLink 
                  href={`https://sepolia.etherscan.io/address/${process.env.REACT_APP_FACTORY_ADDRESS || '0x342d20Fd89f54B386d8506FF5EB72059Fd0f79b7'}`} 
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={16} />
        在 Etherscan 上查看合约
      </HelpLink>
    </ErrorContainer>
  );
};

export default ErrorDisplay;
