'use client';

import { CustomWalletConnect } from '@/components/web3/CustomWalletConnect';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, User, Home, Palette } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useMemo } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  // 缓存导航配置以避免重新渲染
  const navigation = useMemo(() => [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Generate', href: '/generate', icon: Sparkles },
    // { name: 'NFT', href: '/nft', icon: Coins }, // 暂时隐藏入口
    // { name: '市场', href: '/marketplace', icon: Store }, // 暂时隐藏入口
    { name: 'Profile', href: '/profile', icon: User },
  ], []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo 区域 */}
        <div className="mr-6 flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">3D NFT</span>
              <span className="text-xs text-muted-foreground -mt-1">Generator</span>
            </div>
          </Link>
        </div>

        {/* 导航菜单 */}
        <div className="flex flex-1 items-center justify-between">
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-9 px-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* 右侧操作区 */}
          <div className="flex items-center space-x-3">
            {/* 测试页面链接 */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/test">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Test
                </Button>
              </Link>
              <Link href="/api-test">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  API Test
                </Button>
              </Link>
            </div>

            {/* 状态指示器 */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                <div className={cn(
                  "mr-1 h-2 w-2 rounded-full",
                  isConnected ? "bg-green-500" : "bg-gray-500"
                )}></div>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            {/* 钱包连接 - 使用新的自定义组件 */}
            <CustomWalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
}
