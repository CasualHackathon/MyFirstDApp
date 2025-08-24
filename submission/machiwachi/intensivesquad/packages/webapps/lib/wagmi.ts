import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, hardhat } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "intensivesquad",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "default-project-id", // Get this from WalletConnect Cloud
  chains: [sepolia, hardhat],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
