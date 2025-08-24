'use client';

import { useState, useEffect } from 'react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Wallet,
  Smartphone,
  ArrowRight,
  ExternalLink,
  Shield,
  Chrome
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomWalletConnectProps {
  variant?: 'default' | 'new-design';
  className?: string;
}

export function CustomWalletConnect({
  variant = 'default',
  className = ''
}: CustomWalletConnectProps) {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [prevConnected, setPrevConnected] = useState(false);

  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending, error } = useConnect();

  // 监听连接状态变化
  useEffect(() => {
    if (isConnected && !prevConnected && address) {
      const walletName = connector?.name || 'Wallet';
      toast.success(`${walletName} connected`, {
        description: `Address: ${formatAddress(address)}`,
        duration: 3000,
      });
      setShowConnectDialog(false);
    }
    setPrevConnected(isConnected);
  }, [isConnected, prevConnected, address, connector?.name]);

  // 监听连接错误
  useEffect(() => {
    if (error) {
      toast.error('Connection failed', {
        description: error.message,
        duration: 4000,
      });
    }
  }, [error]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async (connectorToUse: any) => {
    try {
      await connect({ connector: connectorToUse });
    } catch (error: any) {
      console.error('Connection error:', error);

      // 详细错误处理
      if (error?.message?.includes('User rejected') || error?.code === 4001) {
        toast.warning('Connection cancelled', {
          description: 'You cancelled the wallet connection request',
          duration: 3000,
        });
      } else if (error?.message?.includes('No MetaMask')) {
        toast.error('MetaMask not installed', {
          description: 'Please install the MetaMask browser extension and try again',
          duration: 5000,
          action: {
            label: 'Install MetaMask',
            onClick: () => window.open('https://metamask.io/download/', '_blank')
          }
        });
      } else if (error?.message?.includes('selectExtension') ||
        error?.cause?.message?.includes('selectExtension') ||
        error?.message?.includes('Unexpected error')) {
        toast.error('Multiple wallet extensions conflict', {
          description: 'Detected multiple wallet extensions. Disable others (e.g. Phantom) and keep only MetaMask',
          duration: 7000,
          action: {
            label: 'Learn more',
            onClick: () => window.open('https://metamask.zendesk.com/hc/en-us/articles/360015489611-How-to-add-a-custom-network-RPC', '_blank')
          }
        });
      } else {
        toast.error('Connection failed', {
          description: error?.message || 'Unknown error, please try again',
          duration: 4000,
        });
      }
    }
  };

  // 获取连接器 - 只支持MetaMask
  const metaMaskConnector = connectors.find(c => c.name === 'MetaMask');

  const handleDisconnect = () => {
    disconnect();
    toast.info('Wallet disconnected');
  };

  // 已连接状态
  if (isConnected && address) {
    if (variant === 'new-design') {
      return (
        <div className="bg-neutral-900 rounded-full flex items-center gap-2 p-2 hover:bg-neutral-800 transition-colors cursor-pointer">
          <span className="text-neutral-100 pl-2">
            {formatAddress(address)}
          </span>
          <div className="flex p-2 rounded-full bg-green-100 items-center justify-center size-8">
            <Wallet className="h-4 w-4 text-green-600" />
          </div>
        </div>
      );
    }

    return (
      <Button variant="outline" size="sm" className="font-medium flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
        <span>{formatAddress(address)}</span>
      </Button>
    );
  }

  // 未连接状态
  return (
    <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
      <DialogTrigger asChild>
        {variant === 'new-design' ? (
          <div className="bg-neutral-900 rounded-full flex items-center gap-2 p-2 hover:bg-neutral-800 transition-colors cursor-pointer">
            <span className="text-neutral-100 pl-2 hover:text-white transition-colors">
              {isPending ? 'Connecting...' : 'Connect Wallet'}
            </span>
            <div className="flex p-2 rounded-full bg-neutral-100 items-center justify-center size-8 hover:bg-neutral-200 transition-colors">
              {isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent"></div>
              ) : (
                <Wallet className="h-4 w-4 text-neutral-900" />
              )}
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            className={`h-9 px-4 font-medium flex items-center space-x-2 ${className}`}
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isPending ? 'Connecting...' : 'Connect Wallet'}
            </span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-2xl font-bold">Connect MetaMask</DialogTitle>
          <DialogDescription className="text-base">
            Please connect your MetaMask wallet to the platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 检查MetaMask是否安装 */}
            {typeof window !== 'undefined' && !window.ethereum?.isMetaMask ? (
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <Chrome className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-orange-800">MetaMask required</div>
                  <div className="text-sm text-orange-700">
                    Please install the MetaMask browser extension
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Button
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Install MetaMask
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Connection Options
              </h3>

              {/* MetaMask 移动端连接 */}
              {metaMaskConnector ? (
                <button
                  onClick={() => handleConnect(metaMaskConnector)}
                  disabled={isPending}
                  className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">MetaMask</div>
                        <div className="text-sm text-muted-foreground">Browser Extension</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ) : (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50">
                  <div className="text-red-800 font-semibold">调试信息</div>
                  <div className="text-red-700 text-sm">未找到 MetaMask 连接器</div>
                </div>
              )}
            </div>
          )}

          {/* 安全提示 */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-foreground mb-1">Security Tips</div>
                <div className="text-muted-foreground">
                  Ensure you use the official MetaMask extension and keep your seed phrase and private keys safe.
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
