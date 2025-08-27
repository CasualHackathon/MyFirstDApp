import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Web3ContextType } from '../types';

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // 添加 Sepolia 网络到 MetaMask
  const addSepoliaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7', // 11155111 in hex
          chainName: 'Sepolia Testnet',
          nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'SEP',
            decimals: 18
          },
          rpcUrls: ['https://sepolia.infura.io/v3/67d1669f03194a7ca5b5b74589c18c2d'],
          blockExplorerUrls: ['https://sepolia.etherscan.io/']
        }]
      });
    } catch (error) {
      console.error('Error adding Sepolia network:', error);
    }
  };

  // 切换到 Sepolia 网络
  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // 网络不存在，添加它
        await addSepoliaNetwork();
      } else {
        console.error('Error switching to Sepolia:', error);
      }
    }
  };

  const connect = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // 请求账户访问
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (accounts.length > 0) {
          // 创建provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          
          const signer = provider.getSigner();
          const account = accounts[0];
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(account);
          setChainId(network.chainId);
          setIsConnected(true);
          
          // 检查网络
          if (network.chainId === 11155111) {
            setIsCorrectNetwork(true);
          } else {
            setIsCorrectNetwork(false);
            // 自动切换到Sepolia网络
            await switchToSepolia();
          }
        }
      } else {
        console.error('MetaMask not found');
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnect();
        }
      });

      window.ethereum.on('chainChanged', async (newChainId: string) => {
        const chainIdNum = parseInt(newChainId, 16);
        setChainId(chainIdNum);
        setIsCorrectNetwork(chainIdNum === 11155111);
        
        // 如果网络改变，重新连接
        if (isConnected) {
          const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
          const ethersSigner = ethersProvider.getSigner();
          setProvider(ethersProvider);
          setSigner(ethersSigner);
        }
      });
    }
  }, []);

  const value: Web3ContextType = {
    account,
    provider,
    signer,
    connect,
    disconnect,
    isConnected,
    chainId,
    isCorrectNetwork,
    switchToSepolia,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

declare global {
  interface Window {
    ethereum: any;
  }
}
