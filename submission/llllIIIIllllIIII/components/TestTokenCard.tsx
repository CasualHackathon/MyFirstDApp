'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { 
  useTokenBalance, 
  useTokenInfo, 
  useCanUseFaucet, 
  useNextFaucetTime,
  useTestTokenWrite 
} from '@/lib/hooks';

export function TestTokenCard() {
  const { address } = useAccount();
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [approveSpender, setApproveSpender] = useState('');
  const [approveAmount, setApproveAmount] = useState('');
  const [mounted, setMounted] = useState(false);

  const { data: balance } = useTokenBalance(address);
  const tokenInfo = useTokenInfo();
  const { data: canUseFaucet } = useCanUseFaucet(address);
  const { data: nextFaucetTime } = useNextFaucetTime(address);

  const { 
    faucet, 
    transfer, 
    approve, 
    hash, 
    isPending, 
    isConfirming, 
    isConfirmed 
  } = useTestTokenWrite();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">測試代幣 (TestToken)</h2>
        <p className="text-gray-600">載入中...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">測試代幣 (TestToken)</h2>
        <p className="text-gray-600">請先連接錢包</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">測試代幣 (TestToken)</h2>
      
      {/* Token Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">代幣信息</h3>
        <p><strong>名稱:</strong> {String(tokenInfo?.name) || 'Loading...'}</p>
        <p><strong>符號:</strong> {String(tokenInfo?.symbol) || 'Loading...'}</p>
        <p><strong>總供應量:</strong> {tokenInfo?.totalSupply ? String(tokenInfo.totalSupply) : 'Loading...'}</p>
        <p><strong>你的餘額:</strong> {String(balance) || '0'} TEST</p>
      </div>

      {/* Faucet Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">代幣水龍頭</h3>
        {canUseFaucet === true ? (
          <button
            onClick={() => faucet()}
            disabled={isPending || isConfirming}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isPending || isConfirming ? '處理中...' : '領取 100 TEST'}
          </button>
        ) : canUseFaucet === false ? (
          <div>
            <p className="text-red-600 mb-2">您今天已經領取過了</p>
            {nextFaucetTime && typeof nextFaucetTime === 'bigint' ? (
              <p className="text-sm text-gray-600">
                下次可領取時間: {new Date(Number(nextFaucetTime) * 1000).toLocaleString()}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-gray-600">檢查水龍頭狀態中...</p>
        )}
      </div>

      {/* Transfer Section */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">轉帳</h3>
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
            placeholder="轉帳數量"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => transfer(transferTo as `0x${string}`, transferAmount)}
            disabled={!transferTo || !transferAmount || isPending || isConfirming}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isPending || isConfirming ? '處理中...' : '轉帳'}
          </button>
        </div>
      </div>

      {/* Approve Section */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">授權</h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="被授權地址"
            value={approveSpender}
            onChange={(e) => setApproveSpender(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="授權數量"
            value={approveAmount}
            onChange={(e) => setApproveAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => approve(approveSpender as `0x${string}`, approveAmount)}
            disabled={!approveSpender || !approveAmount || isPending || isConfirming}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {isPending || isConfirming ? '處理中...' : '授權'}
          </button>
        </div>
      </div>

      {/* Transaction Status */}
      {hash ? (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm">
            交易雜湊: 
            <a 
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-1"
            >
              {String(hash).slice(0, 10)}...{String(hash).slice(-8)}
            </a>
          </p>
          {isConfirmed ? (
            <p className="text-green-600 text-sm mt-1">✅ 交易已確認</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
