import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TokenType } from "./typings";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTokenAmount = (
  amount: number | bigint,
  token: TokenType
) => {
  const formatted = (
    typeof amount === "bigint"
      ? Number(amount) / Math.pow(10, token.decimals)
      : amount
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${token.symbol}`;
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getBlockchainExplorerUrl = (hash: `0x${string}`) => {
  return `https://sepolia.etherscan.io/tx/${hash}`;
};
