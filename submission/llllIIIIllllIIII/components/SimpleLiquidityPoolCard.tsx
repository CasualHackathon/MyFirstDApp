'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  useLiquidityPoolReserves,
  useLiquidityPoolTokens,
  useLPTokenInfo,
  useUserLiquidityInfo,
  useLiquidityQuote,
  useRemoveLiquidityQuote,
  useLiquidityPoolInfo,
  useSimpleLiquidityPool
} from '@/lib/hooks';

export function SimpleLiquidityPoolCard() {
  const { address } = useAccount();
  const [addAmountA, setAddAmountA] = useState('');
  const [addAmountB, setAddAmountB] = useState('');
  const [removeAmount, setRemoveAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [mounted, setMounted] = useState(false);

  const { data: reserves } = useLiquidityPoolReserves();
  const poolTokens = useLiquidityPoolTokens();
  const lpTokenInfo = useLPTokenInfo(address);
  const { data: userLiquidityInfo } = useUserLiquidityInfo(address);
  const { data: liquidityQuote } = useLiquidityQuote(addAmountA);
  const { data: removeQuote } = useRemoveLiquidityQuote(removeAmount);
  const poolInfo = useLiquidityPoolInfo();

  const { 
    addLiquidity,
    removeLiquidity,
    transfer,
    hash, 
    isPending, 
    isConfirming, 
    isConfirmed 
  } = useSimpleLiquidityPool();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">簡單流動性池 (SimpleLiquidityPool)</h2>
        <p className="text-gray-600">載入中...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">簡單流動性池 (SimpleLiquidityPool)</h2>
        <p className="text-gray-600">請先連接錢包</p>
      </div>
    );
  }

  const formatValue = (value: unknown) => {
    if (!value) return '0';
    return parseFloat(String(value)).toFixed(4);
  };

  const reservesArray = reserves as [bigint, bigint] | undefined;
  const removeQuoteArray = removeQuote as [bigint, bigint] | undefined;
  const userLiquidityArray = userLiquidityInfo as [bigint, bigint] | undefined;

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">簡單流動性池 (SimpleLiquidityPool)</h2>
      
      {/* Pool Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">流動性池信息</h3>
        <p><strong>Token A:</strong> {poolTokens?.tokenA ? String(poolTokens.tokenA).slice(0, 10) + '...' : 'Loading...'}</p>
        <p><strong>Token B:</strong> {poolTokens?.tokenB ? String(poolTokens.tokenB).slice(0, 10) + '...' : 'Loading...'}</p>
        <p><strong>Token A 儲備:</strong> {formatValue(reservesArray?.[0])} TEST</p>
        <p><strong>Token B 儲備:</strong> {formatValue(reservesArray?.[1])} TESTB</p>
        <p><strong>LP Token 總供應量:</strong> {lpTokenInfo?.totalSupply ? String(lpTokenInfo.totalSupply) : '0'}</p>
        <p><strong>交易手續費:</strong> {poolInfo?.feePercentage ? String(poolInfo.feePercentage) : '0'}%</p>
      </div>

      {/* User LP Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">你的流動性信息</h3>
        <p><strong>LP Token 餘額:</strong> {lpTokenInfo?.userBalance ? String(lpTokenInfo.userBalance) : '0'}</p>
        <p><strong>你提供的 Token A:</strong> {formatValue(userLiquidityArray?.[0])}</p>
        <p><strong>你提供的 Token B:</strong> {formatValue(userLiquidityArray?.[1])}</p>
      </div>

      {/* Add Liquidity Section */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">添加流動性</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Token A 數量"
            value={addAmountA}
            onChange={(e) => setAddAmountA(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Token B 數量"
            value={addAmountB}
            onChange={(e) => setAddAmountB(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          
          {liquidityQuote && addAmountA && typeof liquidityQuote !== 'undefined' ? (
            <div className="p-3 bg-white rounded border">
              <p className="text-sm text-gray-600">建議 Token B 數量:</p>
              <p className="font-semibold">{formatValue(liquidityQuote)} TESTB</p>
            </div>
          ) : null}

          <button
            onClick={() => addLiquidity(addAmountA, addAmountB)}
            disabled={!addAmountA || !addAmountB || isPending || isConfirming}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isPending || isConfirming ? '處理中...' : '添加流動性'}
          </button>
        </div>
      </div>

      {/* Remove Liquidity Section */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">移除流動性</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="LP Token 數量"
            value={removeAmount}
            onChange={(e) => setRemoveAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />

          {removeQuoteArray && removeAmount && (
            <div className="p-3 bg-white rounded border">
              <p className="text-sm text-gray-600">預估取回:</p>
              <p className="font-semibold">
                {formatValue(removeQuoteArray[0])} TEST + {formatValue(removeQuoteArray[1])} TESTB
              </p>
            </div>
          )}

          <button
            onClick={() => removeLiquidity(removeAmount)}
            disabled={!removeAmount || isPending || isConfirming}
            className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {isPending || isConfirming ? '處理中...' : '移除流動性'}
          </button>
        </div>
      </div>

      {/* Transfer LP Token Section */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">轉移 LP Token</h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="接收地址"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="轉移數量"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => transfer(transferTo as `0x${string}`, transferAmount)}
            disabled={!transferTo || !transferAmount || isPending || isConfirming}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            {isPending || isConfirming ? '處理中...' : '轉移'}
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
