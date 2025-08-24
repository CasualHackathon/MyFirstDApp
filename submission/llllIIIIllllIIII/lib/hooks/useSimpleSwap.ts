import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SimpleSwapABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { parseEther, formatEther } from 'viem';

// Read hooks
export function useSwapReserves() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SimpleSwap as `0x${string}`,
    abi: SimpleSwapABI,
    functionName: 'getReserves',
  });
}

export function useSwapTokens() {
  const { data: tokenA } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleSwap as `0x${string}`,
    abi: SimpleSwapABI,
    functionName: 'tokenA',
  });

  const { data: tokenB } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleSwap as `0x${string}`,
    abi: SimpleSwapABI,
    functionName: 'tokenB',
  });

  return { tokenA, tokenB };
}

export function useSwapAmountOut(amountIn: string, reserveIn: bigint, reserveOut: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SimpleSwap as `0x${string}`,
    abi: SimpleSwapABI,
    functionName: 'getAmountOut',
    args: [parseEther(amountIn), reserveIn, reserveOut],
    query: {
      enabled: Boolean(amountIn) && reserveIn > 0n && reserveOut > 0n,
    },
  });
}

export function useSwapFeeInfo() {
  const { data: feeRate } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleSwap as `0x${string}`,
    abi: SimpleSwapABI,
    functionName: 'FEE_RATE',
  });

  const { data: feeDenominator } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleSwap as `0x${string}`,
    abi: SimpleSwapABI,
    functionName: 'FEE_DENOMINATOR',
  });

  return {
    feeRate: feeRate ? Number(feeRate) : undefined,
    feeDenominator: feeDenominator ? Number(feeDenominator) : undefined,
    feePercentage: feeRate && feeDenominator ? (Number(feeRate) / Number(feeDenominator)) * 100 : undefined,
  };
}

// Write hooks
export function useSimpleSwap() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const swapAForB = (amountIn: string, minAmountOut: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.SimpleSwap as `0x${string}`,
      abi: SimpleSwapABI,
      functionName: 'swapAForB',
      args: [parseEther(amountIn), parseEther(minAmountOut)],
    });
  };

  const swapBForA = (amountIn: string, minAmountOut: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.SimpleSwap as `0x${string}`,
      abi: SimpleSwapABI,
      functionName: 'swapBForA',
      args: [parseEther(amountIn), parseEther(minAmountOut)],
    });
  };

  const addLiquidity = (amountA: string, amountB: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.SimpleSwap as `0x${string}`,
      abi: SimpleSwapABI,
      functionName: 'addLiquidity',
      args: [parseEther(amountA), parseEther(amountB)],
    });
  };

  return {
    swapAForB,
    swapBForA,
    addLiquidity,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
