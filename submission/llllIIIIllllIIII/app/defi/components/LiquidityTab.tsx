"use client";

import { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Loader2, Plus, Minus } from "lucide-react";
import { useAccount } from 'wagmi';

export default function LiquidityTab() {
  const { address, isConnected } = useAccount();
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [removeAmount, setRemoveAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // 模擬數據
  const [lpBalance] = useState('125.75');
  const [sharePercentage] = useState('0.25');
  const [reserveA] = useState('50,000');
  const [reserveB] = useState('49,850');

  // 自動計算另一種代幣數量（保持比例）
  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    if (value && !isNaN(Number(value))) {
      const ratio = Number(reserveB.replace(',', '')) / Number(reserveA.replace(',', ''));
      setAmountB((Number(value) * ratio).toFixed(6));
    } else {
      setAmountB('');
    }
  };

  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    if (value && !isNaN(Number(value))) {
      const ratio = Number(reserveA.replace(',', '')) / Number(reserveB.replace(',', ''));
      setAmountA((Number(value) * ratio).toFixed(6));
    } else {
      setAmountA('');
    }
  };

  const handleAddLiquidity = async () => {
    if (!isConnected || !amountA || !amountB) return;
    setIsAdding(true);
    
    // TODO: 實際的 addLiquidity 邏輯
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsAdding(false);
    setAmountA('');
    setAmountB('');
  };

  const handleRemoveLiquidity = async () => {
    if (!isConnected || !removeAmount) return;
    setIsRemoving(true);
    
    // TODO: 實際的 removeLiquidity 邏輯
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsRemoving(false);
    setRemoveAmount('');
  };

  const handleFaucet = async (tokenSymbol: string) => {
    if (!isConnected) return;
    
    // TODO: 實際的 faucet 邏輯
    console.log(`領取 ${tokenSymbol} 測試幣`);
  };

  // 計算預估 LP 代幣數量
  const calculateLPTokens = () => {
    if (!amountA || !amountB) return '0';
    // 簡化計算：幾何平均值
    return Math.sqrt(Number(amountA) * Number(amountB)).toFixed(6);
  };

  // 計算移除流動性能獲得的代幣
  const calculateRemoveAmounts = () => {
    if (!removeAmount) return { tokenA: '0', tokenB: '0' };
    const percentage = Number(removeAmount) / Number(lpBalance);
    const userReserveA = Number(reserveA.replace(',', '')) * Number(sharePercentage) / 100;
    const userReserveB = Number(reserveB.replace(',', '')) * Number(sharePercentage) / 100;
    
    return {
      tokenA: (userReserveA * percentage).toFixed(6),
      tokenB: (userReserveB * percentage).toFixed(6)
    };
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">請先連接錢包開始使用流動性功能</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 領取測試幣區域 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">領取測試代幣</CardTitle>
          <CardDescription>領取 TUSDC 和 TUSDT 開始提供流動性</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleFaucet('TUSDC')}
            >
              領取 TUSDC
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleFaucet('TUSDT')}
            >
              領取 TUSDT
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 流動性資訊面板 */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">我的 LP 代幣</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{lpBalance}</div>
            <p className="text-xs text-gray-500">TUSDC-TUSDT LP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">池子佔比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{sharePercentage}%</div>
            <p className="text-xs text-gray-500">我的份額</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">TUSDC 儲備</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{reserveA}</div>
            <p className="text-xs text-gray-500">總儲備量</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">TUSDT 儲備</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{reserveB}</div>
            <p className="text-xs text-gray-500">總儲備量</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 添加流動性 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              添加流動性
            </CardTitle>
            <CardDescription>同時提供兩種代幣獲得 LP 代幣</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>TUSDC 數量</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amountA}
                  onChange={(e) => handleAmountAChange(e.target.value)}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>餘額: 2,450.75 TUSDC</span>
                  <button 
                    className="text-blue-600 hover:underline"
                    onClick={() => handleAmountAChange('2450.75')}
                  >
                    最大
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>TUSDT 數量</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amountB}
                  onChange={(e) => handleAmountBChange(e.target.value)}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>餘額: 1,850.25 TUSDT</span>
                  <button 
                    className="text-blue-600 hover:underline"
                    onClick={() => handleAmountBChange('1850.25')}
                  >
                    最大
                  </button>
                </div>
              </div>
            </div>

            {amountA && amountB && (
              <Card className="bg-green-50">
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>預估 LP 代幣</span>
                      <span className="font-semibold">{calculateLPTokens()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>價格比例</span>
                      <span>1 TUSDC = {(Number(amountB) / Number(amountA)).toFixed(6)} TUSDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>池子佔比</span>
                      <span>+0.15%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              className="w-full" 
              onClick={handleAddLiquidity}
              disabled={!amountA || !amountB || isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  添加中...
                </>
              ) : (
                '添加流動性'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 移除流動性 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Minus className="h-5 w-5" />
              移除流動性
            </CardTitle>
            <CardDescription>燃燒 LP 代幣取回基礎代幣</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>LP 代幣數量</Label>
              <Input
                type="number"
                placeholder="0.0"
                value={removeAmount}
                onChange={(e) => setRemoveAmount(e.target.value)}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>LP 餘額: {lpBalance}</span>
                <button 
                  className="text-blue-600 hover:underline"
                  onClick={() => setRemoveAmount(lpBalance)}
                >
                  全部
                </button>
              </div>
            </div>

            {/* 快速選擇百分比 */}
            <div className="grid grid-cols-4 gap-2">
              {['25', '50', '75', '100'].map((percentage) => (
                <Button 
                  key={percentage}
                  variant="outline"
                  size="sm"
                  onClick={() => setRemoveAmount((Number(lpBalance) * Number(percentage) / 100).toString())}
                >
                  {percentage}%
                </Button>
              ))}
            </div>

            {removeAmount && (
              <Card className="bg-orange-50">
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>將收到 TUSDC</span>
                      <span className="font-semibold">{calculateRemoveAmounts().tokenA}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>將收到 TUSDT</span>
                      <span className="font-semibold">{calculateRemoveAmounts().tokenB}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>移除比例</span>
                      <span>{((Number(removeAmount) / Number(lpBalance)) * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              className="w-full" 
              variant="destructive"
              onClick={handleRemoveLiquidity}
              disabled={!removeAmount || isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  移除中...
                </>
              ) : (
                '移除流動性'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
