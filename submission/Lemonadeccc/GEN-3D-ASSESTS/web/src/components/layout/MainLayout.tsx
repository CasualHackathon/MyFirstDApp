import { Header } from './Header';
import { Button } from '@/components/ui/button';
import { ToggleLeft } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  onToggleLayout?: () => void;
}

export function MainLayout({ children, onToggleLayout }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* 布局切换按钮 - 固定在右上角，避开导航栏 */}
      {onToggleLayout && (
        <div className="fixed top-20 right-4 z-[9999]">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleLayout}
            className="flex items-center gap-2 bg-background/90 backdrop-blur-sm shadow-lg border-2"
          >
            <ToggleLeft className="h-4 w-4" />
            T设计
          </Button>
        </div>
      )}
      
      <main className="container mx-auto py-8">
        {children}
      </main>
    </div>
  );
}