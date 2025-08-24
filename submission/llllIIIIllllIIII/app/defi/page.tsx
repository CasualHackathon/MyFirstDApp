"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { TestTokenABI, SimpleSwapABI, SimpleStakingABI, SimpleLiquidityPoolABI } from "../../lib/abi";
import { CONTRACT_ADDRESSES } from "../../lib/contracts";
import { ExternalLink } from "lucide-react";

export default function DeFiPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  
  // Swap State
  const [swapFromToken, setSwapFromToken] = useState('ETH');
  const [swapToToken, setSwapToToken] = useState('USDC');
  const [swapAmount, setSwapAmount] = useState('');
  const [swapStep, setSwapStep] = useState(1);
  
  // Staking State
  const [stakingAmount, setStakingAmount] = useState('');
  const [stakingStep, setStakingStep] = useState(1);
  
  // LP State
  const [lpToken1Amount, setLpToken1Amount] = useState('');
  const [lpToken2Amount, setLpToken2Amount] = useState('');
  const [lpStep, setLpStep] = useState(1);
  
  // Transaction State
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  // Real Contract States
  const [realSwapAmount, setRealSwapAmount] = useState('');
  const [realSwapStep, setRealSwapStep] = useState(1);
  const [realSwapDirection, setRealSwapDirection] = useState('AtoB'); // 'AtoB' or 'BtoA'
  const [realStakingAmount, setRealStakingAmount] = useState('');
  const [realStakingStep, setRealStakingStep] = useState(1);
  const [realLpTokenAAmount, setRealLpTokenAAmount] = useState('');
  const [realLpTokenBAmount, setRealLpTokenBAmount] = useState('');
  const [realLpStep, setRealLpStep] = useState(1);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [unstakeAmount, setUnstakeAmount] = useState('');

  // Contract write hooks
  const { writeContract, data: writeData, isPending: isWritePending } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Contract read hooks for token balances
  const { data: tokenABalance } = useReadContract({
    address: CONTRACT_ADDRESSES.TestToken,
    abi: TestTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: tokenBBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.TokenB,
    abi: TestTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: rewardTokenBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.RewardToken,
    abi: TestTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: stakingBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleStaking,
    abi: SimpleStakingABI,
    functionName: 'getUserInfo',
    args: address ? [address] : undefined,
  });

  const { data: pendingRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleStaking,
    abi: SimpleStakingABI,
    functionName: 'getPendingReward',
    args: address ? [address] : undefined,
  });

  // LP Pool contract reads
  const { data: lpReserves } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool,
    abi: SimpleLiquidityPoolABI,
    functionName: 'getReserves',
  });

  const { data: lpCalculation } = useReadContract({
    address: CONTRACT_ADDRESSES.SimpleLiquidityPool,
    abi: SimpleLiquidityPoolABI,
    functionName: 'calculateLiquidity',
    args: realLpTokenAAmount && realLpTokenBAmount ? [
      parseEther(realLpTokenAAmount || '0'),
      parseEther(realLpTokenBAmount || '0')
    ] : undefined,
  });

  // Input validation helper function
  const handleNumberInput = (value: string, setter: (value: string) => void, maxDecimals: number = 18) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return; // Invalid input, ignore
    }
    
    // Limit decimal places
    if (parts[1] && parts[1].length > maxDecimals) {
      return; // Too many decimal places, ignore
    }
    
    // Prevent leading zeros (except for decimal numbers like 0.1)
    if (numericValue.length > 1 && numericValue[0] === '0' && numericValue[1] !== '.') {
      return;
    }
    
    setter(numericValue);
  };

  // LP calculation helper function
  const calculateOptimalAmount = (inputToken: 'A' | 'B', amount: string) => {
    if (!amount || !lpReserves) {
      return '0';
    }

    // 檢查輸入是否為有效數字
    const cleanAmount = amount.trim();
    if (!/^\d*\.?\d*$/.test(cleanAmount) || cleanAmount === '.' || cleanAmount === '') {
      return '0';
    }

    const reserves = lpReserves as [bigint, bigint];
    const reserveA = reserves[0];
    const reserveB = reserves[1];
    
    if (reserveA === 0n && reserveB === 0n) {
      // 首次添加流動性，比例可以任意
      return cleanAmount;
    }

    try {
      const inputAmount = parseEther(cleanAmount);
      
      if (inputToken === 'A') {
        // 根據 Token A 計算需要的 Token B
        const optimalB = (inputAmount * reserveB) / reserveA;
        return formatEther(optimalB);
      } else {
        // 根據 Token B 計算需要的 Token A
        const optimalA = (inputAmount * reserveA) / reserveB;
        return formatEther(optimalA);
      }
    } catch {
      return '0';
    }
  };

  const handleSwap = async () => {
    setIsLoading(true);
    // 模擬交易過程
    setTimeout(() => {
      setTxHash('0x1234567890abcdef...');
      setSwapStep(4);
      setIsLoading(false);
    }, 3000);
  };

  const handleStaking = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setTxHash('0xabcdef1234567890...');
      setStakingStep(4);
      setIsLoading(false);
    }, 3000);
  };

  const handleLP = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setTxHash('0xfedcba0987654321...');
      setLpStep(4);
      setIsLoading(false);
    }, 3000);
  };

  const claimTestTokens = () => {
    alert('測試代幣已發放到您的錢包！');
  };

  // Real Contract Operations
  const claimFaucetTokens = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.TestToken,
        abi: TestTokenABI,
        functionName: 'faucet',
      });
    } catch (error) {
      console.error('Faucet claim failed:', error);
    }
  };

  const claimTokenBFaucet = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.TokenB,
        abi: TestTokenABI,
        functionName: 'faucet',
      });
    } catch (error) {
      console.error('Token B faucet claim failed:', error);
    }
  };

  const handleRealSwap = async () => {
    if (!realSwapAmount) return;
    
    try {
      if (realSwapDirection === 'AtoB') {
        // Token A -> Token B
        // First approve Token A
        await writeContract({
          address: CONTRACT_ADDRESSES.TestToken,
          abi: TestTokenABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.SimpleSwap, parseEther(realSwapAmount)],
        });
        
        // Then perform swap A for B
        setTimeout(() => {
          writeContract({
            address: CONTRACT_ADDRESSES.SimpleSwap,
            abi: SimpleSwapABI,
            functionName: 'swapAForB',
            args: [parseEther(realSwapAmount), 0], // minAmountOut = 0 for demo
          });
          setRealSwapStep(4);
        }, 2000);
      } else {
        // Token B -> Token A
        // First approve Token B
        await writeContract({
          address: CONTRACT_ADDRESSES.TokenB,
          abi: TestTokenABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.SimpleSwap, parseEther(realSwapAmount)],
        });
        
        // Then perform swap B for A
        setTimeout(() => {
          writeContract({
            address: CONTRACT_ADDRESSES.SimpleSwap,
            abi: SimpleSwapABI,
            functionName: 'swapBForA',
            args: [parseEther(realSwapAmount), 0], // minAmountOut = 0 for demo
          });
          setRealSwapStep(4);
        }, 2000);
      }
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  const handleRealStaking = async () => {
    if (!realStakingAmount) return;
    
    try {
      // First approve tokens
      await writeContract({
        address: CONTRACT_ADDRESSES.TestToken,
        abi: TestTokenABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.SimpleStaking, parseEther(realStakingAmount)],
      });
      
      // Then stake
      setTimeout(() => {
        writeContract({
          address: CONTRACT_ADDRESSES.SimpleStaking,
          abi: SimpleStakingABI,
          functionName: 'stake',
          args: [parseEther(realStakingAmount)],
        });
        setRealStakingStep(4);
      }, 2000);
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  const handleRealLP = async () => {
    if (!realLpTokenAAmount || !realLpTokenBAmount) return;
    
    try {
      // Approve both tokens
      await writeContract({
        address: CONTRACT_ADDRESSES.TestToken,
        abi: TestTokenABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.SimpleLiquidityPool, parseEther(realLpTokenAAmount)],
      });
      
      await writeContract({
        address: CONTRACT_ADDRESSES.TokenB,
        abi: TestTokenABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.SimpleLiquidityPool, parseEther(realLpTokenBAmount)],
      });
      
      // Add liquidity
      setTimeout(() => {
        writeContract({
          address: CONTRACT_ADDRESSES.SimpleLiquidityPool,
          abi: SimpleLiquidityPoolABI,
          functionName: 'addLiquidity',
          args: [
            parseEther(realLpTokenAAmount),
            parseEther(realLpTokenBAmount),
            0, // minLiquidityA
            0, // minLiquidityB
          ],
        });
        setRealLpStep(4);
      }, 3000);
    } catch (error) {
      console.error('Add liquidity failed:', error);
    }
  };

  const handleClaimReward = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.SimpleStaking,
        abi: SimpleStakingABI,
        functionName: 'claimReward',
        args: [],
      });
      setRewardClaimed(true);
      // Reset after 5 seconds
      setTimeout(() => setRewardClaimed(false), 5000);
    } catch (error) {
      console.error('Claim reward failed:', error);
    }
  };

  const handleUnstake = async (amount: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.SimpleStaking,
        abi: SimpleStakingABI,
        functionName: 'unstake',
        args: [parseEther(amount)],
      });
    } catch (error) {
      console.error('Unstake failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DeFi 體驗中心
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            體驗真實的去中心化金融功能：代幣交換、質押收益和流動性提供
          </p>
        </div>

        {!isConnected ? (
          <Card className="p-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">連接錢包開始體驗</h3>
            <p className="text-gray-600 mb-6">
              請先連接您的 Web3 錢包來體驗 DeFi 功能
            </p>
            <ConnectButton />
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Wallet Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">錢包資訊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">錢包地址</p>
                  <p className="font-mono text-sm">{address?.slice(0, 10)}...{address?.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">餘額</p>
                  <p className="font-semibold">{balance?.formatted?.slice(0, 8)} {balance?.symbol}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <Button onClick={claimTestTokens} className="bg-green-600 hover:bg-green-700">
                  🎁 領取測試代幣
                </Button>
              </div>
            </Card>

            {/* DeFi Functions Tabs */}
            <Tabs defaultValue="swap" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="swap">🔄 代幣交換</TabsTrigger>
                <TabsTrigger value="staking">💰 質押收益</TabsTrigger>
                <TabsTrigger value="lp">💧 流動性提供</TabsTrigger>
              </TabsList>

              {/* Swap Tab */}
              <TabsContent value="swap">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">代幣交換 (Swap)</h3>
                  
                  {/* Step Indicator */}
                  <div className="flex items-center mb-6">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          swapStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {swapStep > step ? '✓' : step}
                        </div>
                        {step < 4 && (
                          <div className={`w-12 h-1 ${swapStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    {swapStep === 1 && (
                      <div>
                        <h4 className="font-semibold mb-4">步驟 1: 選擇交換代幣</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                          <div>
                            <label className="block text-sm font-medium mb-2">從</label>
                            <select 
                              value={swapFromToken}
                              onChange={(e) => setSwapFromToken(e.target.value)}
                              className="w-full p-3 border rounded-lg"
                            >
                              <option value="ETH">ETH</option>
                              <option value="USDC">USDC</option>
                              <option value="DAI">DAI</option>
                            </select>
                          </div>
                          
                          {/* Swap Direction Button */}
                          <div className="flex justify-center md:order-1">
                            <Button
                              variant="outline"
                              onClick={() => {
                                const temp = swapFromToken;
                                setSwapFromToken(swapToToken);
                                setSwapToToken(temp);
                              }}
                              className="mx-4 px-3 py-2"
                            >
                              ⇄
                            </Button>
                          </div>
                          
                          <div className="md:order-2">
                            <label className="block text-sm font-medium mb-2">到</label>
                            <select 
                              value={swapToToken}
                              onChange={(e) => setSwapToToken(e.target.value)}
                              className="w-full p-3 border rounded-lg"
                            >
                              <option value="USDC">USDC</option>
                              <option value="ETH">ETH</option>
                              <option value="DAI">DAI</option>
                            </select>
                          </div>
                        </div>
                        <Button onClick={() => setSwapStep(2)} className="mt-4">
                          下一步
                        </Button>
                      </div>
                    )}

                    {swapStep === 2 && (
                      <div>
                        <h4 className="font-semibold mb-4">步驟 2: 輸入交換數量</h4>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            交換數量 ({swapFromToken})
                          </label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={swapAmount}
                            onChange={(e) => handleNumberInput(e.target.value, setSwapAmount, 8)}
                            placeholder="0.0"
                            className="w-full"
                            pattern="[0-9]*[.,]?[0-9]*"
                          />
                          <p className="text-sm text-gray-600 mt-2">
                            預估獲得: {(parseFloat(swapAmount || '0') * 1850).toFixed(2)} {swapToToken}
                          </p>
                        </div>
                        <div className="flex space-x-4 mt-4">
                          <Button variant="outline" onClick={() => setSwapStep(1)}>
                            上一步
                          </Button>
                          <Button onClick={() => setSwapStep(3)} disabled={!swapAmount}>
                            下一步
                          </Button>
                        </div>
                      </div>
                    )}

                    {swapStep === 3 && (
                      <div>
                        <h4 className="font-semibold mb-4">步驟 3: 確認交換</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span>交換</span>
                            <span>{swapAmount} {swapFromToken}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>獲得</span>
                            <span>{(parseFloat(swapAmount || '0') * 1850).toFixed(2)} {swapToToken}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>手續費</span>
                            <span>0.003 ETH</span>
                          </div>
                        </div>
                        <div className="flex space-x-4 mt-4">
                          <Button variant="outline" onClick={() => setSwapStep(2)}>
                            上一步
                          </Button>
                          <Button 
                            onClick={handleSwap} 
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isLoading ? '交換中...' : '確認交換'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {swapStep === 4 && (
                      <Alert className="border-green-200 bg-green-50">
                        <AlertTitle>交換成功！</AlertTitle>
                        <AlertDescription>
                          交易哈希: {txHash}
                          <br />
                          您已成功將 {swapAmount} {swapFromToken} 交換為 {(parseFloat(swapAmount || '0') * 1850).toFixed(2)} {swapToToken}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Staking Tab */}
              <TabsContent value="staking">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">質押收益 (Staking)</h3>
                  
                  {/* Step Indicator */}
                  <div className="flex items-center mb-6">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          stakingStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {stakingStep > step ? '✓' : step}
                        </div>
                        {step < 4 && (
                          <div className={`w-12 h-1 ${stakingStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    {stakingStep === 1 && (
                      <div>
                        <h4 className="font-semibold mb-4">步驟 1: 了解質押條件</h4>
                        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                          <p><strong>質押代幣:</strong> ETH</p>
                          <p><strong>年化收益率:</strong> 5.2%</p>
                          <p><strong>最小質押:</strong> 0.01 ETH</p>
                          <p><strong>鎖定期:</strong> 無鎖定期</p>
                        </div>
                        <Button onClick={() => setStakingStep(2)} className="mt-4">
                          開始質押
                        </Button>
                      </div>
                    )}

                    {stakingStep === 2 && (
                      <div>
                        <h4 className="font-semibold mb-4">步驟 2: 輸入質押數量</h4>
                        <div>
                          <label className="block text-sm font-medium mb-2">質押數量 (ETH)</label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={stakingAmount}
                            onChange={(e) => handleNumberInput(e.target.value, setStakingAmount, 8)}
                            placeholder="0.0"
                            className="w-full"
                            pattern="[0-9]*[.,]?[0-9]*"
                          />
                          <p className="text-sm text-gray-600 mt-2">
                            預估年收益: {(parseFloat(stakingAmount || '0') * 0.052).toFixed(4)} ETH
                          </p>
                        </div>
                        <div className="flex space-x-4 mt-4">
                          <Button variant="outline" onClick={() => setStakingStep(1)}>
                            上一步
                          </Button>
                          <Button onClick={() => setStakingStep(3)} disabled={!stakingAmount}>
                            下一步
                          </Button>
                        </div>
                      </div>
                    )}

                    {stakingStep === 3 && (
                      <div>
                        <h4 className="font-semibold mb-4">步驟 3: 確認質押</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span>質押數量</span>
                            <span>{stakingAmount} ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span>年化收益率</span>
                            <span>5.2%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>預估年收益</span>
                            <span>{(parseFloat(stakingAmount || '0') * 0.052).toFixed(4)} ETH</span>
                          </div>
                        </div>
                        <div className="flex space-x-4 mt-4">
                          <Button variant="outline" onClick={() => setStakingStep(2)}>
                            上一步
                          </Button>
                          <Button 
                            onClick={handleStaking} 
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isLoading ? '質押中...' : '確認質押'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {stakingStep === 4 && (
                      <Alert className="border-green-200 bg-green-50">
                        <AlertTitle>質押成功！</AlertTitle>
                        <AlertDescription>
                          交易哈希: {txHash}
                          <br />
                          您已成功質押 {stakingAmount} ETH，開始賺取收益！
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* LP Tab */}
              <TabsContent value="lp">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">流動性提供 (LP)</h3>
                  
                  {/* Step Indicator */}
                  <div className="flex items-center mb-6">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          lpStep >= step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {lpStep > step ? '✓' : step}
                        </div>
                        {step < 4 && (
                          <div className={`w-12 h-1 ${lpStep > step ? 'bg-purple-600' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    {lpStep === 1 && (
                      <div>
                        <h4 className="font-semibold mb-4">步驟 1: 了解流動性提供</h4>
                        <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                          <p><strong>交易對:</strong> ETH/USDC</p>
                          <p><strong>手續費收益:</strong> 0.3%</p>
                          <p><strong>額外獎勵:</strong> LP 代幣獎勵</p>
                          <p><strong>風險:</strong> 無常損失風險</p>
                        </div>
                        <Button onClick={() => setLpStep(2)} className="mt-4">
                          開始提供流動性
                        </Button>
                      </div>
                    )}

                    {lpStep === 2 && (
                      <div>
                        <h4 className="font-semibold mb-4">步驟 2: 輸入代幣數量</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">ETH 數量</label>
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={lpToken1Amount}
                              onChange={(e) => handleNumberInput(e.target.value, setLpToken1Amount, 8)}
                              placeholder="0.0"
                              className="w-full"
                              pattern="[0-9]*[.,]?[0-9]*"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">USDC 數量</label>
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={lpToken2Amount}
                              onChange={(e) => handleNumberInput(e.target.value, setLpToken2Amount, 6)}
                              placeholder="0.0"
                              className="w-full"
                              pattern="[0-9]*[.,]?[0-9]*"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          預估獲得 LP 代幣: {((parseFloat(lpToken1Amount || '0') + parseFloat(lpToken2Amount || '0')) / 2).toFixed(4)} LP
                        </p>
                        <div className="flex space-x-4 mt-4">
                          <Button variant="outline" onClick={() => setLpStep(1)}>
                            上一步
                          </Button>
                          <Button onClick={() => setLpStep(3)} disabled={!lpToken1Amount || !lpToken2Amount}>
                            下一步
                          </Button>
                        </div>
                      </div>
                    )}

                    {lpStep === 3 && (
                      <div>
                        <h4 className="font-semibold mb-4">步驟 3: 確認流動性提供</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span>ETH 數量</span>
                            <span>{lpToken1Amount} ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span>USDC 數量</span>
                            <span>{lpToken2Amount} USDC</span>
                          </div>
                          <div className="flex justify-between">
                            <span>獲得 LP 代幣</span>
                            <span>{((parseFloat(lpToken1Amount || '0') + parseFloat(lpToken2Amount || '0')) / 2).toFixed(4)} LP</span>
                          </div>
                          <div className="flex justify-between">
                            <span>份額占比</span>
                            <span>0.01%</span>
                          </div>
                        </div>
                        <div className="flex space-x-4 mt-4">
                          <Button variant="outline" onClick={() => setLpStep(2)}>
                            上一步
                          </Button>
                          <Button 
                            onClick={handleLP} 
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {isLoading ? '添加中...' : '確認添加流動性'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {lpStep === 4 && (
                      <Alert className="border-green-200 bg-green-50">
                        <AlertTitle>流動性添加成功！</AlertTitle>
                        <AlertDescription>
                          交易哈希: {txHash}
                          <br />
                          您已成功添加 {lpToken1Amount} ETH 和 {lpToken2Amount} USDC 的流動性！
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Real Contract Operations */}
            <div className="mt-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  🔗 真實合約操作
                </h2>
                <p className="text-lg text-gray-600">
                  與部署在 Sepolia 測試網的真實智能合約進行交互
                </p>
              </div>

              {/* Token Balances Display */}
              <Card className="p-6 mb-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">代幣餘額</h3>
                  <p className="text-sm text-gray-600">查看您的代幣餘額並領取測試代幣</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Token A</p>
                    <p className="font-semibold text-lg">
                      {tokenABalance ? formatEther(tokenABalance as bigint).slice(0, 8) : '0'} 
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Token B</p>
                    <p className="font-semibold text-lg">
                      {tokenBBalance ? formatEther(tokenBBalance as bigint).slice(0, 8) : '0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Reward Token</p>
                    <p className="font-semibold text-lg text-purple-600">
                      {rewardTokenBalance ? formatEther(rewardTokenBalance as bigint).slice(0, 8) : '0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">已質押 Token A</p>
                    <p className="font-semibold text-lg text-blue-600">
                      {stakingBalance && (stakingBalance as any)[0] ? formatEther((stakingBalance as any)[0] as bigint).slice(0, 8) : '0'}
                    </p>
                    {stakingBalance && (stakingBalance as any)[0] && (stakingBalance as any)[0] > 0n ? (
                      <div className="mt-2 space-y-1">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={unstakeAmount}
                          onChange={(e) => handleNumberInput(e.target.value, setUnstakeAmount, 8)}
                          placeholder="解除質押數量"
                          className="text-xs h-6"
                        />
                        <Button 
                          onClick={() => handleUnstake(unstakeAmount)}
                          disabled={isWritePending || isTxLoading || !unstakeAmount}
                          className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1 w-full"
                        >
                          解除質押
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">待領取獎勵</p>
                    <p className="font-semibold text-lg text-green-600">
                      {pendingRewards ? formatEther(pendingRewards as bigint).slice(0, 8) : '0'}
                    </p>
                    {pendingRewards && (pendingRewards as bigint) > 0n ? (
                      <Button 
                        onClick={handleClaimReward}
                        disabled={isWritePending || isTxLoading}
                        className="bg-green-600 hover:bg-green-700 mt-2 text-xs px-3 py-1"
                      >
                        {isWritePending || isTxLoading ? '領取中...' : '領取獎勵'}
                      </Button>
                    ) : null}
                  </div>
                </div>
                
                {/* Faucet Section */}
                <div className="border-t pt-4 mt-4">
                  <div className="text-center mb-3">
                    <p className="text-sm font-medium text-gray-700">測試代幣水龍頭 (Faucet)</p>
                    <p className="text-xs text-gray-500">每小時可以領取一次，每次領取 1000 個代幣</p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={claimFaucetTokens} 
                      disabled={isWritePending || isTxLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isWritePending || isTxLoading ? '領取中...' : '🚰 領取 Token A'}
                    </Button>
                    <Button 
                      onClick={claimTokenBFaucet} 
                      disabled={isWritePending || isTxLoading}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isWritePending || isTxLoading ? '領取中...' : '🚰 領取 Token B'}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Real Contract Tabs */}
              <Tabs defaultValue="real-swap" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="real-swap">🔄 真實交換</TabsTrigger>
                  <TabsTrigger value="real-staking">💰 真實質押</TabsTrigger>
                  <TabsTrigger value="real-lp">💧 真實流動性</TabsTrigger>
                </TabsList>

                {/* Real Swap Tab */}
                <TabsContent value="real-swap">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-6">真實代幣交換</h3>
                    
                    {/* Step Indicator */}
                    <div className="flex items-center mb-6">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            realSwapStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {realSwapStep > step ? '✓' : step}
                          </div>
                          {step < 4 && (
                            <div className={`w-12 h-1 ${realSwapStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6">
                      {realSwapStep === 1 && (
                        <div>
                          <h4 className="font-semibold mb-4">步驟 1: 選擇交換方向</h4>
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                              <p><strong>合約地址:</strong> {CONTRACT_ADDRESSES.SimpleSwap.slice(0, 10)}...</p>
                              <p><strong>網路:</strong> Sepolia 測試網</p>
                              <p><strong>滑點容差:</strong> 1%</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-2">選擇交換方向</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                  onClick={() => setRealSwapDirection('AtoB')}
                                  className={`p-4 rounded-lg border-2 transition-all ${
                                    realSwapDirection === 'AtoB' 
                                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                >
                                  <div className="text-center">
                                    <div className="font-semibold">Token A → Token B</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      餘額: {tokenABalance ? formatEther(tokenABalance as bigint).slice(0, 8) : '0'} Token A
                                    </div>
                                  </div>
                                </button>
                                
                                <button
                                  onClick={() => setRealSwapDirection('BtoA')}
                                  className={`p-4 rounded-lg border-2 transition-all ${
                                    realSwapDirection === 'BtoA' 
                                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                >
                                  <div className="text-center">
                                    <div className="font-semibold">Token B → Token A</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      餘額: {tokenBBalance ? formatEther(tokenBBalance as bigint).slice(0, 8) : '0'} Token B
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
                          <Button onClick={() => setRealSwapStep(2)} className="mt-4">
                            下一步
                          </Button>
                        </div>
                      )}

                      {realSwapStep === 2 && (
                        <div>
                          <h4 className="font-semibold mb-4">步驟 2: 輸入交換數量</h4>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              {realSwapDirection === 'AtoB' ? 'Token A 數量' : 'Token B 數量'}
                            </label>
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={realSwapAmount}
                              onChange={(e) => handleNumberInput(e.target.value, setRealSwapAmount, 8)}
                              placeholder="0.0"
                              className="w-full"
                              pattern="[0-9]*[.,]?[0-9]*"
                            />
                            <p className="text-sm text-gray-600 mt-2">
                              您的餘額: {
                                realSwapDirection === 'AtoB' 
                                  ? (tokenABalance ? formatEther(tokenABalance as bigint).slice(0, 8) : '0') + ' Token A'
                                  : (tokenBBalance ? formatEther(tokenBBalance as bigint).slice(0, 8) : '0') + ' Token B'
                              }
                            </p>
                            <p className="text-sm text-blue-600 mt-2">
                              交換方向: {realSwapDirection === 'AtoB' ? 'Token A → Token B' : 'Token B → Token A'}
                            </p>
                          </div>
                          <div className="flex space-x-4 mt-4">
                            <Button variant="outline" onClick={() => setRealSwapStep(1)}>
                              上一步
                            </Button>
                            <Button onClick={() => setRealSwapStep(3)} disabled={!realSwapAmount}>
                              下一步
                            </Button>
                          </div>
                        </div>
                      )}

                      {realSwapStep === 3 && (
                        <div>
                          <h4 className="font-semibold mb-4">步驟 3: 確認真實交換</h4>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span>交換數量</span>
                              <span>
                                {realSwapAmount} {realSwapDirection === 'AtoB' ? 'Token A' : 'Token B'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>預估獲得</span>
                              <span>
                                ~{realSwapAmount} {realSwapDirection === 'AtoB' ? 'Token B' : 'Token A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>交換方向</span>
                              <span>{realSwapDirection === 'AtoB' ? 'Token A → Token B' : 'Token B → Token A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Gas 費用</span>
                              <span>~0.005 ETH</span>
                            </div>
                          </div>
                          <div className="flex space-x-4 mt-4">
                            <Button variant="outline" onClick={() => setRealSwapStep(2)}>
                              上一步
                            </Button>
                            <Button 
                              onClick={handleRealSwap} 
                              disabled={isWritePending || isTxLoading}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {isWritePending || isTxLoading ? '交換中...' : '確認真實交換'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {realSwapStep === 4 && (
                        <Alert className="border-green-200 bg-green-50">
                          <AlertTitle>真實交換成功！</AlertTitle>
                          <AlertDescription>
                            {writeData && (
                              <>
                                交易哈希: {writeData}
                                <br />
                                <a 
                                  href={`https://sepolia.etherscan.io/tx/${writeData}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  在 Etherscan 上查看 <ExternalLink className="h-3 w-3" />
                                </a>
                              </>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                {/* Real Staking Tab */}
                <TabsContent value="real-staking">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-6">真實質押操作</h3>
                    
                    {/* Step Indicator */}
                    <div className="flex items-center mb-6">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            realStakingStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {realStakingStep > step ? '✓' : step}
                          </div>
                          {step < 4 && (
                            <div className={`w-12 h-1 ${realStakingStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6">
                      {realStakingStep === 1 && (
                        <div>
                          <h4 className="font-semibold mb-4">步驟 1: 了解質押合約</h4>
                          <div className="bg-green-50 p-4 rounded-lg space-y-2">
                            <p><strong>質押代幣:</strong> Token A</p>
                            <p><strong>獎勵代幣:</strong> Reward Token</p>
                            <p><strong>合約地址:</strong> {CONTRACT_ADDRESSES.SimpleStaking.slice(0, 10)}...</p>
                            <p><strong>已質押數量:</strong> {stakingBalance && (stakingBalance as any)[0] ? formatEther((stakingBalance as any)[0] as bigint).slice(0, 8) : '0'} Token A</p>
                            <p><strong>當前獎勵:</strong> {pendingRewards ? formatEther(pendingRewards as bigint).slice(0, 8) : '0'} Reward Token</p>
                          </div>
                          
                          {/* 解除質押區域 */}
                          {stakingBalance && (stakingBalance as any)[0] && (stakingBalance as any)[0] > 0n && (
                            <div className="bg-red-50 p-4 rounded-lg mt-4">
                              <h5 className="font-medium mb-2">解除質押</h5>
                              <div className="flex space-x-2">
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  value={unstakeAmount}
                                  onChange={(e) => handleNumberInput(e.target.value, setUnstakeAmount, 8)}
                                  placeholder="輸入解除質押數量"
                                  className="flex-1"
                                />
                                <Button 
                                  onClick={() => handleUnstake(unstakeAmount)}
                                  disabled={isWritePending || isTxLoading || !unstakeAmount}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {isWritePending || isTxLoading ? '處理中...' : '解除質押'}
                                </Button>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                最大可解除質押: {stakingBalance && (stakingBalance as any)[0] ? formatEther((stakingBalance as any)[0] as bigint).slice(0, 8) : '0'} Token A
                              </p>
                            </div>
                          )}
                          
                          <div className="flex space-x-4 mt-4">
                            <Button onClick={() => setRealStakingStep(2)} className="flex-1">
                              開始質押
                            </Button>
                            {pendingRewards && (pendingRewards as bigint) > 0n ? (
                              <Button 
                                onClick={handleClaimReward}
                                disabled={isWritePending || isTxLoading}
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                {isWritePending || isTxLoading ? '領取中...' : '領取獎勵'}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      )}

                      {realStakingStep === 2 && (
                        <div>
                          <h4 className="font-semibold mb-4">步驟 2: 輸入質押數量</h4>
                          <div>
                            <label className="block text-sm font-medium mb-2">質押數量 (Token A)</label>
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={realStakingAmount}
                              onChange={(e) => handleNumberInput(e.target.value, setRealStakingAmount, 8)}
                              placeholder="0.0"
                              className="w-full"
                              pattern="[0-9]*[.,]?[0-9]*"
                            />
                            <p className="text-sm text-gray-600 mt-2">
                              可用餘額: {tokenABalance ? formatEther(tokenABalance as bigint).slice(0, 8) : '0'} Token A
                            </p>
                          </div>
                          <div className="flex space-x-4 mt-4">
                            <Button variant="outline" onClick={() => setRealStakingStep(1)}>
                              上一步
                            </Button>
                            <Button onClick={() => setRealStakingStep(3)} disabled={!realStakingAmount}>
                              下一步
                            </Button>
                          </div>
                        </div>
                      )}

                      {realStakingStep === 3 && (
                        <div>
                          <h4 className="font-semibold mb-4">步驟 3: 確認質押</h4>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span>質押數量</span>
                              <span>{realStakingAmount} Token A</span>
                            </div>
                            <div className="flex justify-between">
                              <span>合約地址</span>
                              <span>{CONTRACT_ADDRESSES.SimpleStaking.slice(0, 20)}...</span>
                            </div>
                            <div className="flex justify-between">
                              <span>預估 Gas</span>
                              <span>~0.01 ETH</span>
                            </div>
                          </div>
                          <div className="flex space-x-4 mt-4">
                            <Button variant="outline" onClick={() => setRealStakingStep(2)}>
                              上一步
                            </Button>
                            <Button 
                              onClick={handleRealStaking} 
                              disabled={isWritePending || isTxLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isWritePending || isTxLoading ? '質押中...' : '確認真實質押'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {realStakingStep === 4 && (
                        <Alert className="border-green-200 bg-green-50">
                          <AlertTitle>真實質押成功！</AlertTitle>
                          <AlertDescription>
                            {writeData && (
                              <>
                                交易哈希: {writeData}
                                <br />
                                <a 
                                  href={`https://sepolia.etherscan.io/tx/${writeData}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  在 Etherscan 上查看 <ExternalLink className="h-3 w-3" />
                                </a>
                              </>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}

                      {rewardClaimed && (
                        <Alert className="border-yellow-200 bg-yellow-50 mt-4">
                          <AlertTitle>獎勵領取成功！</AlertTitle>
                          <AlertDescription>
                            您的質押獎勵已成功領取到您的錢包中。
                            {writeData && (
                              <>
                                <br />
                                交易哈希: {writeData}
                                <br />
                                <a 
                                  href={`https://sepolia.etherscan.io/tx/${writeData}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  在 Etherscan 上查看 <ExternalLink className="h-3 w-3" />
                                </a>
                              </>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                {/* Real LP Tab */}
                <TabsContent value="real-lp">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-6">真實流動性提供</h3>
                    
                    {/* Step Indicator */}
                    <div className="flex items-center mb-6">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            realLpStep >= step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {realLpStep > step ? '✓' : step}
                          </div>
                          {step < 4 && (
                            <div className={`w-12 h-1 ${realLpStep > step ? 'bg-purple-600' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6">
                      {realLpStep === 1 && (
                        <div>
                          <h4 className="font-semibold mb-4">步驟 1: 了解流動性池</h4>
                          <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                            <p><strong>交易對:</strong> Token A / Token B</p>
                            <p><strong>池合約:</strong> {CONTRACT_ADDRESSES.SimpleLiquidityPool.slice(0, 10)}...</p>
                            <p><strong>網路:</strong> Sepolia 測試網</p>
                            <p><strong>手續費收益:</strong> 實時分配</p>
                          </div>
                          <Button onClick={() => setRealLpStep(2)} className="mt-4">
                            開始添加流動性
                          </Button>
                        </div>
                      )}

                      {realLpStep === 2 && (
                        <div>
                          <h4 className="font-semibold mb-4">步驟 2: 輸入代幣數量</h4>
                          
                          <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <h5 className="font-medium mb-2">流動性池狀態</h5>
                            {lpReserves && Array.isArray(lpReserves) && lpReserves[0] > 0n ? (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Token A 儲備:</span>
                                  <span className="ml-2 font-medium">
                                    {formatEther(lpReserves[0]).slice(0, 8)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Token B 儲備:</span>
                                  <span className="ml-2 font-medium">
                                    {formatEther(lpReserves[1]).slice(0, 8)}
                                  </span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-600">當前比例:</span>
                                  <span className="ml-2 font-medium">
                                    1 Token A = {
                                      (Number(formatEther(lpReserves[1])) / 
                                       Number(formatEther(lpReserves[0]))).toFixed(4)
                                    } Token B
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">首次添加流動性 - 您可以設定初始比例</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Token A 數量</label>
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={realLpTokenAAmount}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleNumberInput(value, setRealLpTokenAAmount, 8);
                                  // 只有在輸入有效且存在池儲備時才計算
                                  if (value && lpReserves && Array.isArray(lpReserves) && /^\d*\.?\d*$/.test(value.trim()) && value.trim() !== '' && value.trim() !== '.') {
                                    const optimalB = calculateOptimalAmount('A', value);
                                    if (optimalB && optimalB !== '0') {
                                      setRealLpTokenBAmount(optimalB.slice(0, 10));
                                    }
                                  } else if (!value || value.trim() === '') {
                                    setRealLpTokenBAmount('');
                                  }
                                }}
                                placeholder="0.0"
                                className="w-full"
                                pattern="[0-9]*[.,]?[0-9]*"
                              />
                              <p className="text-sm text-gray-600 mt-1">
                                餘額: {tokenABalance ? formatEther(tokenABalance as bigint).slice(0, 8) : '0'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Token B 數量</label>
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={realLpTokenBAmount}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleNumberInput(value, setRealLpTokenBAmount, 8);
                                  // 只有在輸入有效且存在池儲備時才計算
                                  if (value && lpReserves && Array.isArray(lpReserves) && /^\d*\.?\d*$/.test(value.trim()) && value.trim() !== '' && value.trim() !== '.') {
                                    const optimalA = calculateOptimalAmount('B', value);
                                    if (optimalA && optimalA !== '0') {
                                      setRealLpTokenAAmount(optimalA.slice(0, 10));
                                    }
                                  } else if (!value || value.trim() === '') {
                                    setRealLpTokenAAmount('');
                                  }
                                }}
                                placeholder="0.0"
                                className="w-full"
                                pattern="[0-9]*[.,]?[0-9]*"
                              />
                              <p className="text-sm text-gray-600 mt-1">
                                餘額: {tokenBBalance ? formatEther(tokenBBalance as bigint).slice(0, 8) : '0'}
                              </p>
                            </div>
                          </div>

                          {realLpTokenAAmount && realLpTokenBAmount && (
                            <div className="bg-green-50 p-4 rounded-lg mt-4">
                              <h5 className="font-medium mb-2">添加流動性預覽</h5>
                              <div className="text-sm space-y-1">
                                {lpCalculation ? (
                                  <>
                                    <div>實際添加 Token A: {(() => {
                                      try {
                                        const calc = lpCalculation as [bigint, bigint, bigint];
                                        return formatEther(calc[0]).slice(0, 8);
                                      } catch {
                                        return realLpTokenAAmount;
                                      }
                                    })()}</div>
                                    <div>實際添加 Token B: {(() => {
                                      try {
                                        const calc = lpCalculation as [bigint, bigint, bigint];
                                        return formatEther(calc[1]).slice(0, 8);
                                      } catch {
                                        return realLpTokenBAmount;
                                      }
                                    })()}</div>
                                    <div>將獲得 LP 代幣: {(() => {
                                      try {
                                        const calc = lpCalculation as [bigint, bigint, bigint];
                                        return formatEther(calc[2]).slice(0, 8);
                                      } catch {
                                        return '計算中...';
                                      }
                                    })()}</div>
                                  </>
                                ) : (
                                  <>
                                    <div>實際添加 Token A: {realLpTokenAAmount}</div>
                                    <div>實際添加 Token B: {realLpTokenBAmount}</div>
                                    <div>將獲得 LP 代幣: 計算中...</div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-4 mt-4">
                            <Button variant="outline" onClick={() => setRealLpStep(1)}>
                              上一步
                            </Button>
                            <Button onClick={() => setRealLpStep(3)} disabled={!realLpTokenAAmount || !realLpTokenBAmount}>
                              下一步
                            </Button>
                          </div>
                        </div>
                      )}

                      {realLpStep === 3 && (
                        <div>
                          <h4 className="font-semibold mb-4">步驟 3: 確認添加流動性</h4>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span>Token A 數量</span>
                              <span>{realLpTokenAAmount} Token A</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Token B 數量</span>
                              <span>{realLpTokenBAmount} Token B</span>
                            </div>
                            <div className="flex justify-between">
                              <span>合約地址</span>
                              <span>{CONTRACT_ADDRESSES.SimpleLiquidityPool.slice(0, 20)}...</span>
                            </div>
                            <div className="flex justify-between">
                              <span>預估 Gas</span>
                              <span>~0.015 ETH</span>
                            </div>
                          </div>
                          <div className="flex space-x-4 mt-4">
                            <Button variant="outline" onClick={() => setRealLpStep(2)}>
                              上一步
                            </Button>
                            <Button 
                              onClick={handleRealLP} 
                              disabled={isWritePending || isTxLoading}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              {isWritePending || isTxLoading ? '添加中...' : '確認添加流動性'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {realLpStep === 4 && (
                        <Alert className="border-green-200 bg-green-50">
                          <AlertTitle>流動性添加成功！</AlertTitle>
                          <AlertDescription>
                            {writeData && (
                              <>
                                交易哈希: {writeData}
                                <br />
                                <a 
                                  href={`https://sepolia.etherscan.io/tx/${writeData}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  在 Etherscan 上查看 <ExternalLink className="h-3 w-3" />
                                </a>
                              </>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
