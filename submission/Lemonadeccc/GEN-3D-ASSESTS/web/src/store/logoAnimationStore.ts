import { create } from 'zustand';

interface LogoAnimationState {
  // 状态
  speedMultiplier: number;
  isAPILoading: boolean;
  apiProgress: number;
  isPageTransitioning: boolean;
  isUserInteracting: boolean;
  isHovering: boolean;
  isClicked: boolean;
  
  // Actions
  setAPIState: (loading: boolean, progress?: number) => void;
  setPageTransition: (transitioning: boolean) => void;
  setUserInteraction: (interacting: boolean) => void;
  setHoverState: (hovering: boolean) => void;
  setClickState: (clicked: boolean) => void;
  reset: () => void;
  
  // Computed
  getCurrentSpeed: () => number;
}

export const useLogoAnimation = create<LogoAnimationState>((set, get) => ({
  // 初始状态
  speedMultiplier: 1.0,
  isAPILoading: false,
  apiProgress: 0,
  isPageTransitioning: false,
  isUserInteracting: false,
  isHovering: false,
  isClicked: false,
  
  // Actions
  setAPIState: (loading: boolean, progress: number = 0) => {
    const currentState = get();
    // 只有当状态实际发生变化时才更新 (允许0.5%的进度差异)
    if (currentState.isAPILoading !== loading || Math.abs(currentState.apiProgress - progress) >= 0.5) {
      set({ isAPILoading: loading, apiProgress: progress });
    }
  },
  
  setPageTransition: (transitioning: boolean) => {
    set({ isPageTransitioning: transitioning });
  },
  
  setUserInteraction: (interacting: boolean) => {
    set({ isUserInteracting: interacting });
  },
  
  setHoverState: (hovering: boolean) => {
    set({ isHovering: hovering });
  },
  
  setClickState: (clicked: boolean) => {
    set({ isClicked: clicked });
  },
  
  reset: () => {
    set({
      isAPILoading: false,
      apiProgress: 0,
      isPageTransitioning: false,
      isUserInteracting: false,
      isHovering: false,
      isClicked: false,
    });
  },
  
  // 计算当前速度倍数
  getCurrentSpeed: () => {
    const state = get();
    let multiplier = 1.0; // 基础速度
    
    // 优先级顺序: 点击 > 页面切换 > API加载 > Hover > 用户交互
    if (state.isClicked) {
      multiplier = 4.0; // 点击时更快
    } else if (state.isPageTransitioning) {
      multiplier = 3.5; // 页面切换时显著加快
    } else if (state.isAPILoading) {
      // API加载时根据进度调整速度: 1.8x - 3.2x
      multiplier = 1.8 + (state.apiProgress / 100) * 1.4;
    } else if (state.isHovering) {
      multiplier = 2.5; // Hover时适中加快
    } else if (state.isUserInteracting) {
      multiplier = 1.8; // 用户交互时轻微加快
    }
    
    return multiplier;
  },
}));