'use client';

import { QueryProvider } from './QueryProvider';
import { Web3Provider } from '@/components/web3/Web3Provider';
import { Toaster } from '@/components/ui/sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Web3Provider>
      <QueryProvider>
        {children}
        <Toaster position="top-right" />
      </QueryProvider>
    </Web3Provider>
  );
}