'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Box, ToggleLeft, ToggleRight } from 'lucide-react';

export function GlobalLayoutToggle() {
  const [useNewLayout, setUseNewLayout] = useState(false);

  // 从 localStorage 恢复布局偏好
  useEffect(() => {
    const savedLayout = localStorage.getItem('layout-preference');
    if (savedLayout) {
      setUseNewLayout(savedLayout === 'tStyle');
    }
  }, []);

  // 保存布局偏好到 localStorage
  const toggleLayout = () => {
    const newLayoutState = !useNewLayout;
    setUseNewLayout(newLayoutState);
    localStorage.setItem('layout-preference', newLayoutState ? 'tStyle' : 'original');
    
    // 刷新页面以应用新布局
    window.location.reload();
  };

  return (
    <div className="fixed top-20 right-4 z-[9999]">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleLayout}
        className="flex items-center gap-2 bg-background/90 backdrop-blur-sm shadow-lg border-2"
      >
        {useNewLayout ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
        {useNewLayout ? '原版' : 'T设计'}
      </Button>
    </div>
  );
}