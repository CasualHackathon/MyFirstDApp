import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { TestTokenABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { parseEther, formatEther } from 'viem';

// Read hooks
export function useTokenBalance(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TestToken as `0x${string}`,
    abi: TestTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });
}

export function useTokenInfo() {
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESSES.TestToken as `0x${string}`,
    abi: TestTokenABI,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESSES.TestToken as `0x${string}`,
    abi: TestTokenABI,
    functionName: 'symbol',
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.TestToken as `0x${string}`,
    abi: TestTokenABI,
    functionName: 'totalSupply',
  });

  const { data: faucetAmount } = useReadContract({
    address: CONTRACT_ADDRESSES.TestToken as `0x${string}`,
    abi: TestTokenABI,
    functionName: 'FAUCET_AMOUNT',
  });

  const { data: faucetCooldown } = useReadContract({
    address: CONTRACT_ADDRESSES.TestToken as `0x${string}`,
    abi: TestTokenABI,
    functionName: 'FAUCET_COOLDOWN',
  });

  return {
    name,
    symbol,
    totalSupply: totalSupply ? formatEther(totalSupply as bigint) : undefined,
    faucetAmount: faucetAmount ? formatEther(faucetAmount as bigint) : undefined,
    faucetCooldown: faucetCooldown ? Number(faucetCooldown) : undefined,
  };
}

export function useCanUseFaucet(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TestToken as `0x${string}`,
    abi: TestTokenABI,
    functionName: 'canUseFaucet',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });
}

export function useNextFaucetTime(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TestToken as `0x${string}`,
    abi: TestTokenABI,
    functionName: 'getNextFaucetTime',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });
}

// Write hooks
export function useTestTokenWrite() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const faucet = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.TestToken as `0x${string}`,
      abi: TestTokenABI,
      functionName: 'faucet',
    });
  };

  const transfer = (to: `0x${string}`, amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.TestToken as `0x${string}`,
      abi: TestTokenABI,
      functionName: 'transfer',
      args: [to, parseEther(amount)],
    });
  };

  const approve = (spender: `0x${string}`, amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.TestToken as `0x${string}`,
      abi: TestTokenABI,
      functionName: 'approve',
      args: [spender, parseEther(amount)],
    });
  };

  return {
    faucet,
    transfer,
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
