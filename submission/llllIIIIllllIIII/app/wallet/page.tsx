"use client";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { ethers } from "ethers";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';

export default function WalletPage() {
  // RainbowKit/wagmi hooks
  const { address, isConnected } = useAccount();
  const { data: realBalance, isLoading: balanceLoading } = useBalance({
    address,
    chainId: 11155111, // Sepolia
  });

  // 模擬錢包狀態
  const [wallet, setWallet] = useState<{ address: string; mnemonic: string; privateKey: string } | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [balance, setBalance] = useState<string>("100.00");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState<string>("");

  // 建立新錢包（模擬）
  const createWallet = () => {
    const randomWallet = ethers.Wallet.createRandom();
    setWallet({
      address: randomWallet.address,
      mnemonic: randomWallet.mnemonic?.phrase || "",
      privateKey: randomWallet.privateKey,
    });
    setBalance("100.00");
    setTxStatus("");
  };

  // 模擬轉帳
  const handleSend = () => {
    if (!wallet) return;
    if (!ethers.isAddress(toAddress)) {
      setTxStatus("收款地址格式錯誤");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setTxStatus("請輸入正確的金額");
      return;
    }
    const currentBalance = parseFloat(balance);
    if (amt > currentBalance) {
      setTxStatus("餘額不足");
      return;
    }

    setBalance((currentBalance - amt).toFixed(2));
    setTxStatus(`成功轉帳 ${amt} ETH 到 ${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`);
    setToAddress("");
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="text-center py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            體驗錢包功能
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            學習錢包建立、轉帳、收款流程，熟悉基本操作
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* 真實錢包區塊 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">真實錢包連接</h3>
            
            {isConnected && address ? (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">錢包地址</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigator.clipboard.writeText(address)}
                      className="text-blue-600"
                    >
                      複製
                    </Button>
                  </div>
                  <code className="text-sm text-gray-600 break-all">
                    {address}
                  </code>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <span className="font-semibold text-gray-700">餘額</span>
                  <p className="text-lg text-gray-900">
                    {balanceLoading ? "載入中..." : `${realBalance?.formatted || "0"} ${realBalance?.symbol || "ETH"}`}
                  </p>
                </div>

                <Alert>
                  <AlertTitle>已連接真實錢包</AlertTitle>
                  <AlertDescription>
                    這是您真實的 Web3 錢包，可以在 DeFi 頁面進行實際交易操作。
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">連接您的 Web3 錢包以開始體驗</p>
                <p className="text-sm text-gray-500">支援 MetaMask、WalletConnect 等多種錢包</p>
              </div>
            )}
          </div>

          {/* 模擬錢包區塊 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">模擬錢包體驗</h3>
            
            {!wallet ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-6">建立模擬錢包來學習基本操作</p>
                <Button onClick={createWallet} className="bg-blue-600 hover:bg-blue-700">
                  建立模擬錢包
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 錢包資訊 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">錢包資訊</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">地址: </span>
                      <code className="text-gray-900">{wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}</code>
                    </div>
                    <div>
                      <span className="text-gray-600">餘額: </span>
                      <span className="font-semibold text-gray-900">{balance} ETH</span>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-3">
                        查看助記詞
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>助記詞</DialogTitle>
                        <DialogDescription>
                          請安全保存您的助記詞，這是恢復錢包的唯一方式
                        </DialogDescription>
                      </DialogHeader>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <code className="text-sm text-gray-900">
                          {wallet.mnemonic}
                        </code>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* 轉帳功能 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">模擬轉帳</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        收款地址
                      </label>
                      <Input
                        value={toAddress}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToAddress(e.target.value)}
                        placeholder="0x..."
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        轉帳金額 (ETH)
                      </label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                        placeholder="0.0"
                        step="0.01"
                        className="text-sm"
                      />
                    </div>
                    <Button 
                      onClick={handleSend} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!toAddress || !amount}
                    >
                      確認轉帳
                    </Button>
                  </div>
                </div>

                {/* 交易狀態 */}
                {txStatus && (
                  <Alert className={txStatus.includes("成功") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertTitle>交易狀態</AlertTitle>
                    <AlertDescription>{txStatus}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            🚀 安全的錢包體驗環境，學習基本操作
          </p>
          <p className="text-sm text-gray-500 mt-2">
            模擬錢包僅供學習，不涉及真實資產
          </p>
        </div>
      </footer>
    </div>
  );
}
