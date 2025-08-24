"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export default function Navigation() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/', label: '首頁', icon: '🏠' },
    { href: '/wallet', label: '錢包體驗', icon: '💼' },
    { href: '/defi', label: 'DeFi 體驗', icon: '🔄' },
    { href: '/nft', label: 'NFT 體驗', icon: '🎨' },
  ];

  return (
    <>
      {/* Navigation Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                MyFirstDapp
              </Link>
              <nav className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Faucet Information - Always visible on all pages except home */}
      {pathname !== '/' && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">🚰 需要 Sepolia ETH？</h3>
                  <p className="text-sm text-blue-700">
                    使用 Google Cloud Web3 水龍頭獲取免費的測試 ETH，開始您的 Web3 體驗
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600">
                  <a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank" rel="noopener noreferrer">
                    💧 獲取測試 ETH
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
