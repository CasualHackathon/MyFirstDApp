// wagmi config 檔案（可供自訂 RPC、chains 擴充）
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
  appName: 'MyFirstDapp',
  projectId: '02e7c26d7af45b48996c89cbdaa80c81', // ← 需替換
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});
