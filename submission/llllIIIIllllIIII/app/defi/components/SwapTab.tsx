"use client";

import { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { useAccount } from 'wagmi';

export default function SwapTab() {
  const { address, isConnected } = useAccount();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('TUSDC');
  const [toToken, setToToken] = useState('TUSDT');
  const [isSwapping, setIsSwapping] = useState(false);

  // 模擬匯率計算
  const calculateOutput = (amount: string) => {
    if (!amount || isNaN(Number(amount))) return '';
    const rate = fromToken === 'TUSDC' ? 0.998 : 1.002; // 簡單的模擬匯率
    return (Number(amount) * rate).toFixed(6);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateOutput(value));
  };

  const handleTokenSwitch = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    if (!isConnected) return;
    setIsSwapping(true);
    
    // TODO: 實際的 swap 邏輯
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSwapping(false);
    setFromAmount('');
    setToAmount('');
  };

  const handleFaucet = async (tokenSymbol: string) => {
    if (!isConnected) return;
    
    // TODO: 實際的 faucet 邏輯
    console.log(`領取 ${tokenSymbol} 測試幣`);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">請先連接錢包開始使用代幣兌換功能</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 領取測試幣區域 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">領取測試代幣</CardTitle>
          <CardDescription>每小時可領取一次免費測試代幣</CardDescription>
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

      {/* 兌換區域 */}
      <div className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <Label>從</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
              />
            </div>
            <div className="w-20">
              <select 
                className="w-full h-10 px-3 border rounded-md"
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
              >
                <option value="TUSDC">TUSDC</option>
                <option value="TUSDT">TUSDT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTokenSwitch}
            className="rounded-full"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <Label>到</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="w-20">
              <select 
                className="w-full h-10 px-3 border rounded-md"
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
              >
                <option value="TUSDC">TUSDC</option>
                <option value="TUSDT">TUSDT</option>
              </select>
            </div>
          </div>
        </div>

        {/* 兌換資訊 */}
        {fromAmount && toAmount && (
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">匯率</span>
                  <span>1 {fromToken} ≈ {calculateOutput('1')} {toToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">手續費</span>
                  <span>0.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">預估滑點</span>
                  <span>0.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 兌換按鈕 */}
        <Button 
          className="w-full" 
          onClick={handleSwap}
          disabled={!fromAmount || !toAmount || isSwapping || fromToken === toToken}
        >
          {isSwapping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              兌換中...
            </>
          ) : (
            '兌換'
          )}
        </Button>
      </div>
    </div>
  );
}
