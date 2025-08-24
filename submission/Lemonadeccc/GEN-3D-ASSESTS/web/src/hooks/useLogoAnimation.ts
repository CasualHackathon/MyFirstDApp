'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLogoAnimation } from '@/store/logoAnimationStore';

export function useGlobalLogoEvents() {
  const router = useRouter();
  const logoStore = useLogoAnimation();

  // 用户交互监听 (点击和输入) - 临时禁用以排除SelectTrigger冲突
  useEffect(() => {
    // 暂时注释掉用户交互监听，专注于页面跳转和hover效果
    return () => {};
  }, [logoStore]);

  // 路由变化监听 - Next.js App Router优化版
  useEffect(() => {
    let transitionTimeout: NodeJS.Timeout;
    
    // 监听链接点击
    const handleLinkClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && link.href !== window.location.href) {
        logoStore.setPageTransition(true);
        
        // 页面切换后恢复正常速度
        clearTimeout(transitionTimeout);
        transitionTimeout = setTimeout(() => {
          logoStore.setPageTransition(false);
        }, 2000); // 延长到2秒以确保切换完成
      }
    };
    
    // 监听浏览器前进后退
    const handlePopState = () => {
      logoStore.setPageTransition(true);
      clearTimeout(transitionTimeout);
      transitionTimeout = setTimeout(() => {
        logoStore.setPageTransition(false);
      }, 1500);
    };
    
    // 监听页面可见性变化（页面切换时会触发）
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logoStore.setPageTransition(true);
      } else {
        clearTimeout(transitionTimeout);
        transitionTimeout = setTimeout(() => {
          logoStore.setPageTransition(false);
        }, 1000);
      }
    };
    
    document.addEventListener('click', handleLinkClick, { passive: true });
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(transitionTimeout);
      document.removeEventListener('click', handleLinkClick);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logoStore]);

  // 移除导致无限循环的reset调用
  // 组件卸载时的清理工作可以在具体的组件中处理
}

// API状态监听Hook - 用于在生成页面中监听API状态
export function useAPILogoIntegration(isGenerating: boolean, progress: number = 0) {
  const logoStore = useLogoAnimation();
  
  useEffect(() => {
    // 使用防抖来避免频繁更新
    const timeoutId = setTimeout(() => {
      logoStore.setAPIState(isGenerating, progress);
    }, 50); // 50ms防抖
    
    return () => clearTimeout(timeoutId);
  }, [isGenerating, progress, logoStore]);
}