import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SimpleStakingABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { parseEther, formatEther } from 'viem';

// Read hooks
export function useStakingUserInfo(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SimpleStaking as `0x${string}`,
    abi: SimpleStakingABI,
    functionName: 'getUserInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });
}

export function usePendingReward(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SimpleStaking as `0x${string}`,
    abi: SimpleStakingABI,
    functionName: 'getPendingReward',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });
}

export function useStakingContractInfo() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SimpleStaking as `0x${string}`,
    abi: SimpleStakingABI,
    functionName: 'getContractInfo',
  });
}

export function useStakingTokens() {
  const { data: stakingToken } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleStaking as `0x${string}`,
    abi: SimpleStakingABI,
    functionName: 'stakingToken',
  });

  const { data: rewardToken } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleStaking as `0x${string}`,
    abi: SimpleStakingABI,
    functionName: 'rewardToken',
  });

  return { stakingToken, rewardToken };
}

export function useStakingConstants() {
  const { data: rewardRate } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleStaking as `0x${string}`,
    abi: SimpleStakingABI,
    functionName: 'REWARD_RATE',
  });

  const { data: rewardDenominator } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleStaking as `0x${string}`,
    abi: SimpleStakingABI,
    functionName: 'REWARD_DENOMINATOR',
  });

  return {
    rewardRate: rewardRate ? Number(rewardRate) : undefined,
    rewardDenominator: rewardDenominator ? Number(rewardDenominator) : undefined,
    apy: rewardRate && rewardDenominator ? 
      ((Number(rewardRate) / Number(rewardDenominator)) * 365 * 24 * 60 * 60 * 100) : undefined,
  };
}

// Write hooks
export function useSimpleStaking() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const stake = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.SimpleStaking as `0x${string}`,
      abi: SimpleStakingABI,
      functionName: 'stake',
      args: [parseEther(amount)],
    });
  };

  const unstake = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.SimpleStaking as `0x${string}`,
      abi: SimpleStakingABI,
      functionName: 'unstake',
      args: [parseEther(amount)],
    });
  };

  const claimReward = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.SimpleStaking as `0x${string}`,
      abi: SimpleStakingABI,
      functionName: 'claimReward',
    });
  };

  const addRewards = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.SimpleStaking as `0x${string}`,
      abi: SimpleStakingABI,
      functionName: 'addRewards',
      args: [parseEther(amount)],
    });
  };

  return {
    stake,
    unstake,
    claimReward,
    addRewards,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
