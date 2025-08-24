import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SimpleLiquidityPoolABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { parseEther, formatEther } from 'viem';

// Read hooks
export function useLiquidityPoolReserves() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
    abi: SimpleLiquidityPoolABI,
    functionName: 'getReserves',
  });
}

export function useLiquidityPoolTokens() {
  const { data: tokenA } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
    abi: SimpleLiquidityPoolABI,
    functionName: 'tokenA',
  });

  const { data: tokenB } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
    abi: SimpleLiquidityPoolABI,
    functionName: 'tokenB',
  });

  return { tokenA, tokenB };
}

export function useLPTokenInfo(address?: `0x${string}`) {
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
    abi: SimpleLiquidityPoolABI,
    functionName: 'totalSupply',
  });

  const { data: userBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
    abi: SimpleLiquidityPoolABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  return {
    totalSupply: totalSupply ? formatEther(totalSupply as bigint) : '0',
    userBalance: userBalance ? formatEther(userBalance as bigint) : '0',
  };
}

export function useUserLiquidityInfo(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
    abi: SimpleLiquidityPoolABI,
    functionName: 'getUserLiquidityInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });
}

export function useLiquidityQuote(amountA: string) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
    abi: SimpleLiquidityPoolABI,
    functionName: 'quote',
    args: [parseEther(amountA || '0')],
    query: {
      enabled: Boolean(amountA && parseFloat(amountA) > 0),
    },
  });
}

export function useRemoveLiquidityQuote(lpTokenAmount: string) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
    abi: SimpleLiquidityPoolABI,
    functionName: 'calculateRemoveAmounts',
    args: [parseEther(lpTokenAmount || '0')],
    query: {
      enabled: Boolean(lpTokenAmount && parseFloat(lpTokenAmount) > 0),
    },
  });
}

export function useLiquidityPoolInfo() {
  const { data: fee } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
    abi: SimpleLiquidityPoolABI,
    functionName: 'FEE',
  });

  const { data: feeDenominator } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
    abi: SimpleLiquidityPoolABI,
    functionName: 'FEE_DENOMINATOR',
  });

  return {
    fee: fee ? Number(fee) : undefined,
    feeDenominator: feeDenominator ? Number(feeDenominator) : undefined,
    feePercentage: fee && feeDenominator ? 
      (Number(fee) / Number(feeDenominator) * 100).toFixed(2) : undefined,
  };
}

// Write hooks
export function useSimpleLiquidityPool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const addLiquidity = (amountA: string, amountB: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
      abi: SimpleLiquidityPoolABI,
      functionName: 'addLiquidity',
      args: [parseEther(amountA), parseEther(amountB)],
    });
  };

  const removeLiquidity = (lpTokenAmount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
      abi: SimpleLiquidityPoolABI,
      functionName: 'removeLiquidity',
      args: [parseEther(lpTokenAmount)],
    });
  };

  const transfer = (to: `0x${string}`, amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
      abi: SimpleLiquidityPoolABI,
      functionName: 'transfer',
      args: [to, parseEther(amount)],
    });
  };

  const approve = (spender: `0x${string}`, amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.SimpleLiquidityPool as `0x${string}`,
      abi: SimpleLiquidityPoolABI,
      functionName: 'approve',
      args: [spender, parseEther(amount)],
    });
  };

  return {
    addLiquidity,
    removeLiquidity,
    transfer,
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
