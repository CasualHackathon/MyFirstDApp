import React from 'react';
import styled from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context';
import { Database, Wallet, LogOut, Wifi, WifiOff, Wrench } from 'lucide-react';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  
  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const WalletSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ConnectButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const AccountAddress = styled.span`
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
`;

const DisconnectButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const NetworkButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
  
  &.wrong-network {
    background: rgba(255, 107, 107, 0.3);
    border-color: rgba(255, 107, 107, 0.5);
    
    &:hover {
      background: rgba(255, 107, 107, 0.4);
    }
  }
`;

const NetworkStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &.correct {
    background: rgba(76, 175, 80, 0.2);
    border-color: rgba(76, 175, 80, 0.4);
  }
  
  &.wrong {
    background: rgba(255, 152, 0, 0.2);
    border-color: rgba(255, 152, 0, 0.4);
  }
`;

const DebugButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const Header: React.FC<{ onDebugClick: () => void }> = ({ onDebugClick }) => {
  const { account, connect, disconnect, isConnected, chainId, isCorrectNetwork, switchToSepolia } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 137: return 'Polygon';
      case 56: return 'BSC';
      default: return `Chain ${chainId}`;
    }
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <Database />
          DD Project Manager
        </Logo>
        
        <WalletSection>
          {!isConnected ? (
            <ConnectButton onClick={connect}>
              <Wallet />
              Connect Wallet
            </ConnectButton>
          ) : (
            <>
              {/* 调试按钮 */}
              <DebugButton onClick={onDebugClick}>
                <Wrench size={16} />
                Debug
              </DebugButton>
              
              {/* 网络状态显示 */}
              <NetworkStatus className={isCorrectNetwork ? 'correct' : 'wrong'}>
                {isCorrectNetwork ? <Wifi size={16} /> : <WifiOff size={16} />}
                {getNetworkName(chainId)}
              </NetworkStatus>
              
              {/* 网络切换按钮 */}
              {!isCorrectNetwork && (
                <NetworkButton 
                  onClick={switchToSepolia}
                  className="wrong-network"
                >
                  Switch to Sepolia
                </NetworkButton>
              )}
              
              <AccountInfo>
                <AccountAddress>{formatAddress(account!)}</AccountAddress>
                <DisconnectButton onClick={disconnect} title="Disconnect">
                  <LogOut size={16} />
                </DisconnectButton>
              </AccountInfo>
            </>
          )}
        </WalletSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
