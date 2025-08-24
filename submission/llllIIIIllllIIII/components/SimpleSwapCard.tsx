'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  useSwapReserves,
  useSwapTokens,
  useSwapAmountOut,
  useSwapFeeInfo,
  useSimpleSwap
} from '@/lib/hooks';

export function SimpleSwapCard() {
  const { address } = useAccount();
  const [swapAmount, setSwapAmount] = useState('');
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB');
  const [minAmountOut, setMinAmountOut] = useState('');
  const [liquidityAmountA, setLiquidityAmountA] = useState('');
  const [liquidityAmountB, setLiquidityAmountB] = useState('');
  const [mounted, setMounted] = useState(false);

  const { data: reserves } = useSwapReserves();
  const swapTokens = useSwapTokens();
  const feeInfo = useSwapFeeInfo();

  // Calculate amount out when reserves and swap amount are available
  const reservesArray = reserves as [bigint, bigint] | undefined;
  const { data: amountOut } = useSwapAmountOut(
    swapAmount || '0',
    swapDirection === 'AtoB' ? (reservesArray?.[0] || 0n) : (reservesArray?.[1] || 0n),
    swapDirection === 'AtoB' ? (reservesArray?.[1] || 0n) : (reservesArray?.[0] || 0n)
  );

  const { 
    swapAForB,
    swapBForA,
    addLiquidity,
    hash, 
    isPending, 
    isConfirming, 
    isConfirmed 
  } = useSimpleSwap();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">簡單交換 (SimpleSwap)</h2>
        <p className="text-gray-600">載入中...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">簡單交換 (SimpleSwap)</h2>
        <p className="text-gray-600">請先連接錢包</p>
      </div>
    );
  }

  const formatReserve = (reserve: unknown) => {
    if (!reserve) return '0';
    return parseFloat(String(reserve)).toFixed(4);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">簡單交換 (SimpleSwap)</h2>
      
      {/* Pool Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">流動性池信息</h3>
        <p><strong>Token A 地址:</strong> {swapTokens?.tokenA ? String(swapTokens.tokenA).slice(0, 10) + '...' : 'Loading...'}</p>
        <p><strong>Token B 地址:</strong> {swapTokens?.tokenB ? String(swapTokens.tokenB).slice(0, 10) + '...' : 'Loading...'}</p>
        <p><strong>Token A 儲備:</strong> {formatReserve(reservesArray?.[0])} TEST</p>
        <p><strong>Token B 儲備:</strong> {formatReserve(reservesArray?.[1])} TESTB</p>
        <p><strong>交易手續費:</strong> {feeInfo?.feePercentage ? String(feeInfo.feePercentage) : '0'}%</p>
      </div>

      {/* Swap Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">代幣交換</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">交換方向</label>
            <select
              value={swapDirection}
              onChange={(e) => setSwapDirection(e.target.value as 'AtoB' | 'BtoA')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="AtoB">TEST → TESTB</option>
              <option value="BtoA">TESTB → TEST</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">輸入數量</label>
            <input
              type="number"
              placeholder="交換數量"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">最小輸出數量 (滑點保護)</label>
            <input
              type="number"
              placeholder="最小輸出數量"
              value={minAmountOut}
              onChange={(e) => setMinAmountOut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {amountOut && swapAmount && typeof amountOut !== 'undefined' ? (
            <div className="p-3 bg-white rounded border">
              <p className="text-sm text-gray-600">預估輸出:</p>
              <p className="font-semibold">{formatReserve(amountOut)} {swapDirection === 'AtoB' ? 'TESTB' : 'TEST'}</p>
            </div>
          ) : null}

          <button
            onClick={() => {
              if (swapDirection === 'AtoB') {
                swapAForB(swapAmount, minAmountOut || '0');
              } else {
                swapBForA(swapAmount, minAmountOut || '0');
              }
            }}
            disabled={!swapAmount || isPending || isConfirming}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isPending || isConfirming ? '處理中...' : '交換'}
          </button>
        </div>
      </div>

      {/* Add Liquidity Section */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">添加流動性</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Token A 數量"
            value={liquidityAmountA}
            onChange={(e) => setLiquidityAmountA(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Token B 數量"
            value={liquidityAmountB}
            onChange={(e) => setLiquidityAmountB(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => addLiquidity(liquidityAmountA, liquidityAmountB)}
            disabled={!liquidityAmountA || !liquidityAmountB || isPending || isConfirming}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isPending || isConfirming ? '處理中...' : '添加流動性'}
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
