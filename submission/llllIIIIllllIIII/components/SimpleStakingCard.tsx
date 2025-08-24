'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  useStakingUserInfo,
  usePendingReward,
  useStakingContractInfo,
  useStakingTokens,
  useStakingConstants,
  useSimpleStaking
} from '@/lib/hooks';

export function SimpleStakingCard() {
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [mounted, setMounted] = useState(false);

  const { data: userInfo } = useStakingUserInfo(address);
  const { data: pendingReward } = usePendingReward(address);
  const { data: contractInfo } = useStakingContractInfo();
  const stakingTokens = useStakingTokens();
  const stakingConstants = useStakingConstants();

  const { 
    stake,
    unstake,
    claimReward,
    addRewards,
    hash, 
    isPending, 
    isConfirming, 
    isConfirmed 
  } = useSimpleStaking();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">簡單質押 (SimpleStaking)</h2>
        <p className="text-gray-600">載入中...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">簡單質押 (SimpleStaking)</h2>
        <p className="text-gray-600">請先連接錢包</p>
      </div>
    );
  }

  const formatValue = (value: unknown) => {
    if (!value) return '0';
    return parseFloat(String(value)).toFixed(4);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">簡單質押 (SimpleStaking)</h2>
      
      {/* Contract Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">合約信息</h3>
        <p><strong>質押代幣:</strong> {stakingTokens?.stakingToken ? String(stakingTokens.stakingToken).slice(0, 10) + '...' : 'Loading...'}</p>
        <p><strong>獎勵代幣:</strong> {stakingTokens?.rewardToken ? String(stakingTokens.rewardToken).slice(0, 10) + '...' : 'Loading...'}</p>
        <p><strong>年化收益率 (APY):</strong> {stakingConstants?.apy ? Number(stakingConstants.apy).toFixed(2) : '0'}%</p>
        <p><strong>獎勵比率:</strong> {stakingConstants?.rewardRate ? String(stakingConstants.rewardRate) : '0'} / {stakingConstants?.rewardDenominator ? String(stakingConstants.rewardDenominator) : '1'}</p>
      </div>

      {/* User Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">你的質押信息</h3>
        <p><strong>已質押數量:</strong> {formatValue((userInfo as any)?.[0])} TEST</p>
        <p><strong>待領取獎勵:</strong> {pendingReward ? formatValue(pendingReward) : '0'} REWARD</p>
        <p><strong>最後更新時間:</strong> {(userInfo as any)?.[1] ? new Date(Number((userInfo as any)[1]) * 1000).toLocaleString() : 'N/A'}</p>
      </div>

      {/* Stake Section */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">質押代幣</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="質押數量"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => stake(stakeAmount)}
            disabled={!stakeAmount || isPending || isConfirming}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isPending || isConfirming ? '處理中...' : '質押'}
          </button>
        </div>
      </div>

      {/* Unstake Section */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">取回質押</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="取回數量"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => unstake(unstakeAmount)}
            disabled={!unstakeAmount || isPending || isConfirming}
            className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {isPending || isConfirming ? '處理中...' : '取回質押'}
          </button>
        </div>
      </div>

      {/* Claim Reward Section */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">領取獎勵</h3>
        <button
          onClick={() => claimReward()}
          disabled={isPending || isConfirming}
          className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          {isPending || isConfirming ? '處理中...' : '領取獎勵'}
        </button>
      </div>

      {/* Add Rewards Section (Admin only) */}
      <div className="mb-6 p-4 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">添加獎勵 (管理員功能)</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="獎勵數量"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => addRewards(rewardAmount)}
            disabled={!rewardAmount || isPending || isConfirming}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {isPending || isConfirming ? '處理中...' : '添加獎勵'}
          </button>
        </div>
      </div>

      {/* Transaction Status */}
      {hash && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm">
            交易雜湊: 
            <a 
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-1"
            >
              {hash.slice(0, 10)}...{hash.slice(-8)}
            </a>
          </p>
          {isConfirmed && (
            <p className="text-green-600 text-sm mt-1">✅ 交易已確認</p>
          )}
        </div>
      )}
    </div>
  );
}
