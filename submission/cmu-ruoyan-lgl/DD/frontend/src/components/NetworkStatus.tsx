import React from 'react';
import styled from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const NetworkIndicator = styled.div<{ isCorrect: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.isCorrect ? '#48bb78' : '#f56565'};
`;

const NetworkStatus: React.FC = () => {
  const { chainId, isCorrectNetwork, isConnected } = useWeb3();

  if (!isConnected) {
    return (
      <StatusContainer style={{ background: '#fed7d7', color: '#c53030' }}>
        <NetworkIndicator isCorrect={false} />
        Not Connected
      </StatusContainer>
    );
  }

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 5:
        return 'Goerli Testnet';
      case 137:
        return 'Polygon';
      case 56:
        return 'BSC';
      default:
        return `Chain ID: ${chainId}`;
    }
  };

  return (
    <StatusContainer 
      style={{ 
        background: isCorrectNetwork ? '#c6f6d5' : '#fed7d7',
        color: isCorrectNetwork ? '#22543d' : '#c53030'
      }}
    >
      <NetworkIndicator isCorrect={isCorrectNetwork} />
      {getNetworkName(chainId)}
      {!isCorrectNetwork && (
        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
          (Switch to Sepolia)
        </span>
      )}
    </StatusContainer>
  );
};

export default NetworkStatus;
