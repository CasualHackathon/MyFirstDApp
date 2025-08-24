'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/shared/utils';
import {
  Home,
  Sparkles,
  User,
  ShoppingBag,
  TestTube,
  Coins
} from 'lucide-react';

const navigation = [
  { name: '首页', href: '/', icon: 'Home' },
  { name: 'AI生成', href: '/generate', icon: 'Sparkles' },
  // { name: '我的NFT', href: '/nft', icon: 'Coins' }, // 暂时隐藏入口
  { name: '我的资产', href: '/profile', icon: 'User' },
  // { name: 'NFT市场', href: '/marketplace', icon: 'ShoppingBag' }, // 暂时隐藏入口
  { name: 'SDK测试', href: '/meshy-test', icon: 'TestTube', badge: 'SDK' },
  { name: 'API格式测试', href: '/api-test', icon: 'TestTube', badge: 'API' },
  { name: '测试页面', href: '/test', icon: 'TestTube', badge: 'DEV' },
];

const iconMap = {
  Home,
  Sparkles,
  User,
  ShoppingBag,
  TestTube,
  Coins,
};

export function NavigationMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = iconMap[item.icon as keyof typeof iconMap];
        return (
          <Button
            key={item.href}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className={cn(
              "flex items-center space-x-2",
              isActive && "bg-blue-600 hover:bg-blue-700"
            )}
            asChild
          >
            <Link href={item.href}>
              <IconComponent className="h-4 w-4" />
              <span>{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
