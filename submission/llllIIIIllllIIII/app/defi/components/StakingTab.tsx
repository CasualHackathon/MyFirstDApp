"use client";

import { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { useAccount } from 'wagmi';

export default function StakingTab() {
  const { address, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);

  // 模擬數據
  const [stakedBalance] = useState('1250.50');
  const [pendingRewards] = useState('25.75');
  const [apy] = useState('12.5');

  const handleStake = async () => {
    if (!isConnected || !stakeAmount) return;
    setIsStaking(true);
    
    // TODO: 實際的 stake 邏輯
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsStaking(false);
    setStakeAmount('');
  };

  const handleUnstake = async () => {
    if (!isConnected || !unstakeAmount) return;
    setIsUnstaking(true);
    
    // TODO: 實際的 unstake 邏輯
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsUnstaking(false);
    setUnstakeAmount('');
  };

  const handleClaimRewards = async () => {
    if (!isConnected) return;
    
    // TODO: 實際的 claim 邏輯
    console.log('領取質押獎勵');
  };

  const handleFaucet = async () => {
    if (!isConnected) return;
    
    // TODO: 實際的 faucet 邏輯
    console.log('領取 TUSDC 測試幣');
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">請先連接錢包開始使用質押功能</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 領取測試幣區域 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">領取測試代幣</CardTitle>
          <CardDescription>領取 TUSDC 開始質押體驗</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleFaucet}
          >
            領取 TUSDC
          </Button>
        </CardContent>
      </Card>

      {/* 質押資訊面板 */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">已質押</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stakedBalance}</div>
            <p className="text-xs text-gray-500">TUSDC</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">待領取獎勵</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pendingRewards}</div>
            <p className="text-xs text-gray-500">REWARD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              年化收益率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{apy}%</div>
            <p className="text-xs text-gray-500">APY</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 質押區域 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">質押 TUSDC</CardTitle>
            <CardDescription>質押代幣開始賺取獎勵</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>質押數量</Label>
              <Input
                type="number"
                placeholder="輸入質押數量"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>可用餘額: 2,450.75 TUSDC</span>
                <button 
                  className="text-blue-600 hover:underline"
                  onClick={() => setStakeAmount('2450.75')}
                >
                  最大
                </button>
              </div>
            </div>

            {stakeAmount && (
              <Card className="bg-blue-50">
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>預估日收益</span>
                      <span className="text-green-600">
                        +{(Number(stakeAmount) * Number(apy) / 100 / 365).toFixed(4)} REWARD
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>預估年收益</span>
                      <span className="text-green-600">
                        +{(Number(stakeAmount) * Number(apy) / 100).toFixed(2)} REWARD
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              className="w-full" 
              onClick={handleStake}
              disabled={!stakeAmount || isStaking}
            >
              {isStaking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  質押中...
                </>
              ) : (
                '開始質押'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 取消質押區域 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">取消質押</CardTitle>
            <CardDescription>取回質押的代幣</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>取消質押數量</Label>
              <Input
                type="number"
                placeholder="輸入取消質押數量"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>已質押: {stakedBalance} TUSDC</span>
                <button 
                  className="text-blue-600 hover:underline"
                  onClick={() => setUnstakeAmount(stakedBalance)}
                >
                  全部
                </button>
              </div>
            </div>

            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleUnstake}
              disabled={!unstakeAmount || isUnstaking}
            >
              {isUnstaking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  取消質押中...
                </>
              ) : (
                '取消質押'
              )}
            </Button>

            {/* 領取獎勵 */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">待領取獎勵</span>
                <span className="text-green-600 font-bold">{pendingRewards} REWARD</span>
              </div>
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={handleClaimRewards}
                disabled={Number(pendingRewards) === 0}
              >
                領取獎勵
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
