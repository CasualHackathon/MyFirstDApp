'use client';

// 禁用静态生成
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/web3/Navbar';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { THomepage } from '@/components/layout/THomepage';
import { 
  Sparkles, 
  ArrowRight,
  Users,
  TrendingUp,
  Zap,
  Coins,
  Palette,
  Box
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-generated 3D Models',
    description: 'Use advanced Meshy AI to generate high-quality 3D models from text or images',
    href: '/generate'
  },
  {
    icon: Palette,
    title: 'Intelligent Texture Editing',
    description: 'Supports retexturing, PBR material generation, and mesh optimization',
    href: '/generate'
  },
  {
    icon: Box,
    title: '3D Model Preview',
    description: 'Preview in real-time, rotate the model, and export in multiple formats',
    href: '/generate'
  },
  {
    icon: Coins,
    title: 'NFT Minting',
    description: 'Mint 3D models as NFTs to ensure uniqueness and ownership',
    href: '/nft'
  },
];

const stats = [
  { label: 'Models Generated', value: '10K+' },
  { label: 'Active Users', value: '1K+' },
  { label: 'NFT Trades', value: '500+' },
];

// 原版主页内容组件
function OriginalHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <section className="text-center space-y-8 py-12">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm">
              🚀 AI-Powered 3D NFT Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Turn your ideas into
              <br />
              3D NFT Assets
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate unique 3D models from text or images using AI, with advanced editing and animation, then mint as NFTs
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/generate">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Generating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/nft">
                <Coins className="mr-2 h-5 w-5" />
                My NFTs
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-8 pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Powerful Features</h2>
            <p className="text-muted-foreground">
              One-stop 3D asset creation from AI generation to NFT minting
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.title} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={feature.href}>
                    <CardHeader className="text-center">
                      <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-center">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-muted/50 rounded-2xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Workflow</h2>
            <p className="text-muted-foreground">
              Four simple steps from idea to NFT
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'AI Generation', desc: 'Enter text or upload images' },
              { step: '02', title: 'Preview & Edit', desc: 'Preview and refine your model' },
              { step: '03', title: 'Texture', desc: 'Optional texture regeneration' },
              { step: '04', title: 'Mint NFT', desc: 'Mint as a unique NFT' },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {index < 3 && (
                  <ArrowRight className="hidden md:block mx-auto mt-4 h-6 w-6 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-16">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Ready to start creating?</h2>
            <p className="text-muted-foreground">
              Join our creator community and start your 3D NFT journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/generate">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Generating Now
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/test">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Tech Demo
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function HomePage() {
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
  };

  // 如果使用新布局，返回T风格的布局包装器
  if (useNewLayout) {
    return (
      <LayoutWrapper defaultLayout="tStyle">
        <THomepage />
      </LayoutWrapper>
    );
  }

  // 否则返回原版布局，但添加切换按钮
  return (
    <div className="relative">
          {/* Layout toggle - fixed at top right */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLayout}
          className="flex items-center gap-2 bg-background/80 backdrop-blur-sm"
        >
          <Box className="h-4 w-4" />
          T Layout
        </Button>
      </div>
      
      <OriginalHomePage />
    </div>
  );
}
