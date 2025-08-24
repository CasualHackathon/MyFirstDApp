"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CloudIcon, PhotoIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        {/* Hero Section */}
        <div className="px-5 text-center">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">🌤️ 欢迎来到</span>
            <span className="block text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Moment NFT
            </span>
          </h1>
          <p className="text-xl mt-4 text-base-content/70 max-w-2xl mx-auto">
            用实时天气 + 地理信息驱动 AI 生成独特海报图片，并铸造成 NFT。 每个 NFT 记录了一个「此地此刻」的数字纪念。
          </p>

          {connectedAddress && (
            <div className="flex justify-center items-center space-x-2 flex-col mt-6">
              <p className="font-medium">已连接钱包:</p>
              <Address address={connectedAddress} />
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">✨ 核心特色</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col bg-base-100 px-6 py-8 text-center items-center rounded-3xl shadow-lg">
                <CloudIcon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">🌍 实时天气数据</h3>
                <p className="text-base-content/70">基于用户所在位置与天气，保证每张图都是独一无二的时空片段</p>
              </div>

              <div className="flex flex-col bg-base-100 px-6 py-8 text-center items-center rounded-3xl shadow-lg">
                <SparklesIcon className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-xl font-bold mb-2">🎨 AI 智能生成</h3>
                <p className="text-base-content/70">使用最新AI技术自动生成风格化海报，每一张都是艺术品</p>
              </div>

              <div className="flex flex-col bg-base-100 px-6 py-8 text-center items-center rounded-3xl shadow-lg">
                <PhotoIcon className="h-12 w-12 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2">💎 NFT 铸造</h3>
                <p className="text-base-content/70">ERC-721标准，每天每地限量1枚，保证稀缺性和收藏价值</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6 flex-col sm:flex-row">
              <Link href="/create" className="btn btn-primary btn-lg">
                🎨 创建天气NFT
              </Link>
              {connectedAddress && (
                <Link href="/me" className="btn btn-secondary btn-lg">
                  🖼️ 我的收藏
                </Link>
              )}
              {/* <Link href="/debug" className="btn btn-outline btn-lg">
                🔧 调试合约
              </Link> */}
            </div>

            {/* Stats */}
            <div className="stats shadow mt-12 max-w-2xl mx-auto">
              <div className="stat">
                <div className="stat-title">已铸造NFT</div>
                <div className="stat-value text-primary">42</div>
                <div className="stat-desc">来自全球各地</div>
              </div>

              <div className="stat">
                <div className="stat-title">支持城市</div>
                <div className="stat-value text-secondary">∞</div>
                <div className="stat-desc">覆盖全球</div>
              </div>

              <div className="stat">
                <div className="stat-title">活跃用户</div>
                <div className="stat-value text-accent">15</div>
                <div className="stat-desc">持续增长</div>
              </div>
            </div>

            {/* How it works */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-center mb-8">🚀 工作原理</h2>
              <div className="steps steps-vertical lg:steps-horizontal">
                <div className="step step-primary">连接钱包</div>
                <div className="step step-primary">输入位置</div>
                <div className="step step-primary">获取天气</div>
                <div className="step step-primary">AI生成图片</div>
                <div className="step step-primary">上传IPFS</div>
                <div className="step step-primary">铸造NFT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
