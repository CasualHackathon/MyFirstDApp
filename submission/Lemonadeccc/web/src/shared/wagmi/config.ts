'use client';

import { createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { http } from 'viem';
import { metaMask } from 'wagmi/connectors';

// 获取环境变量
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA || 'https://sepolia.drpc.org';

// 动态获取应用URL
const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // 服务端渲染时的默认值
  return process.env.NEXT_PUBLIC_APP_URL || 'https://gen3d.app';
};

// 构建连接器数组 - 仅使用 MetaMask，避免多注入冲突
const connectors = [
  metaMask({
    dappMetadata: {
      name: 'GEN-3D-ASSETS', 
      url: getAppUrl(),
      iconUrl: `${getAppUrl()}/favicon.ico`,
    },
  }),
];

export const config = createConfig({
  chains: [sepolia],
  connectors,
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
  },
  multiInjectedProviderDiscovery: false,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
