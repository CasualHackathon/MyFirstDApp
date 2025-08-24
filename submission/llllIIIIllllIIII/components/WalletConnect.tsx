'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          載入中...
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <ConnectButton />
    </div>
  );
}
