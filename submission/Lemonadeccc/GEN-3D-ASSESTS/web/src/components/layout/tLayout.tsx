'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { TNavigation } from "./tNavigation";
import { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface TLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export default function TLayout({ children, showNavigation = true }: TLayoutProps) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} antialiased w-screen h-screen relative bg-black overflow-hidden m-0 p-0`}
    >
      {/* 背景内容层 - 可以放置3D元素或其他背景内容 */}
      <div className="w-full h-full fixed top-0 flex items-center justify-center">
        {/* 这里可以放置背景3D元素 */}
        <div className="flex-grow max-w-[100vh] anim-show opacity-0">
          {/* 背景装饰元素占位 */}
        </div>
      </div>

      {/* 主要内容层 */}
      <div className="w-full h-full flex flex-col justify-between px-10 py-12 z-10 relative">
        {/* 顶部导航区域 */}
        {showNavigation && (
          <TNavigation />
        )}

        {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}