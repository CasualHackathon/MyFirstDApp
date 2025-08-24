import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { HeaderActions } from './HeaderActions';
import { NavigationMenu } from './NavigationMenu';

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            3D NFT Platform
          </span>
        </Link>

        {/* Navigation - 使用客户端组件 */}
        <div className="ml-8">
          <NavigationMenu />
        </div>

        {/* 右侧按钮 - 使用客户端组件 */}
        <div className="ml-auto">
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}