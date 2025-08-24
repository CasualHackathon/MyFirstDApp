'use client';

import React from 'react';

interface LogoErrorBoundaryProps {
  children: React.ReactNode;
}

interface LogoErrorBoundaryState {
  hasError: boolean;
}

class LogoErrorBoundary extends React.Component<LogoErrorBoundaryProps, LogoErrorBoundaryState> {
  constructor(props: LogoErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): LogoErrorBoundaryState {
    // 更新state使得下次渲染显示fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 这里可以记录错误到错误报告服务
    console.warn('Logo 3D component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 回退到简单的文字logo
      return (
        <div className="w-16 h-16 flex items-center justify-center">
          <div className="text-2xl font-bold text-white">3D</div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LogoErrorBoundary;