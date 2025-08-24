'use client';

import { ConnectKitButton } from 'connectkit';
import { Button } from '@/components/ui/button';
import { Wallet, Settings } from 'lucide-react';

export function HeaderActions() {
  const handleSettings = () => {
    // TODO: 实现设置功能
    console.log('Settings clicked');
  };

  return (
    <div className="flex items-center space-x-2">
      {/* 使用ConnectKit的钱包连接 */}
      <ConnectKitButton.Custom>
        {({ isConnected, isConnecting, show, truncatedAddress, ensName }) => {
          return (
            <Button 
              variant="outline" 
              size="sm"
              onClick={show}
              disabled={isConnecting}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {isConnected ? (truncatedAddress || ensName) : (isConnecting ? 'Connecting...' : 'Connect Wallet')}
            </Button>
          );
        }}
      </ConnectKitButton.Custom>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleSettings}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}
