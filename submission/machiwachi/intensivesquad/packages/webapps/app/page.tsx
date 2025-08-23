"use client";

import { RxRocket } from "react-icons/rx";

import { SiRefinedgithub } from "react-icons/si";
import { FaStarOfLife } from "react-icons/fa6";
import { PiStarFourFill } from "react-icons/pi";

import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/ui/card";
import { ArrowRightIcon, GiftIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { GiGreekTemple, GiWarAxe } from "react-icons/gi";
import Image from "next/image";

const Wave = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1560 97"
      xmlns="http://www.w3.org/2000/svg"
      className=""
    >
      <defs>
        <clipPath id="sineClip">
          <path
            d="M-1560,48.5 Q-1400,23.5 -1240,48.5 T-920,48.5 Q-760,23.5 -600,48.5 T-280,48.5 Q-120,23.5 40,48.5 T360,48.5 Q520,23.5 680,48.5 T1000,48.5 Q1160,23.5 1320,48.5 T1640,48.5 Q1800,23.5 1960,48.5 T2280,48.5 Q2440,23.5 2600,48.5 T2920,48.5 L2920,0 L-1560,0 Z"
            fill="#fdfd96"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -320,0; 0,0"
              dur="20s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.5; 1"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </path>
        </clipPath>
      </defs>

      <rect width="1560" height="97" fill="#fef3c6" clipPath="url(#sineClip)" />

      <path
        d="M-1560,48.5 Q-1400,23.5 -1240,48.5 T-920,48.5 Q-760,23.5 -600,48.5 T-280,48.5 Q-120,23.5 40,48.5 T360,48.5 Q520,23.5 680,48.5 T1000,48.5 Q1160,23.5 1320,48.5 T1640,48.5 Q1800,23.5 1960,48.5 T2280,48.5 Q2440,23.5 2600,48.5 T2920,48.5"
        stroke="#000"
        strokeWidth="4"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -320,0; 0,0"
          dur="20s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0; 0.5; 1"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
        />
      </path>
    </svg>
  );
};

export default function HomePage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const cards = document.querySelectorAll(".fade-in-card");
    cards.forEach((card) => {
      observerRef.current?.observe(card);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="">
      {/* Header */}
      <header className="fixed w-full z-10">
        <div className="px-4 py-6 bg-amber-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/pixel-archer.png"
                  alt="logo"
                  width={60}
                  height={60}
                />
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  残酷小队
                </h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/leaderboard">
                <Button className="gap-2 bg-red-500/60 ">
                  <GiWarAxe className="w-4 h-4" />
                  战场
                </Button>
              </Link>
              <Link href="/shrine">
                <Button className="gap-2 bg-emerald-500 ">
                  <GiGreekTemple className="w-4 h-4" />
                  商店
                </Button>
              </Link>
              <Link href="/pool">
                <Button className="gap-2 bg-cyan-500/60 ">
                  <GiftIcon className="w-4 h-4" />
                  奖池
                </Button>
              </Link>
            </nav>
          </div>
        </div>
        <div className="bottom-0 left-0 w-full ">
          {/* <img src="/wave.svg" className="w-full h-full object-cover" /> */}
          <Wave />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 pt-48 sm:pt-60 bg-neo-pink/60">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <Badge className="bg-accent text-accent-foreground font-bold px-4 py-2 text-sm rotate-1">
                  🔥 为了部落！FOR THE TRIBE!
                </Badge>
              </div>
              <h1 className="text-6xl md:text-7xl font-black leading-none mb-6">
                团结越强，分红越高! <br />
                <span className="bg-neo-green/80 px-2 py-1 inline-block">
                  DO it together!
                </span>
              </h1>
              <p className="mb-4 font-black border-l-3 pl-2 leading-8">
                🎮
                为高强度共学社群打造链上激励系统，采用“个人贡献+团队荣誉”双代币机制与动态博弈设计，彻底解决团队协作中的动力不均与成员退出难题，实现团队与个人利益的深度绑定。
              </p>
              <p className="text-lg text-muted-foreground mb-8 font-[family-name:var(--font-dm-sans)]">
                ⚡ 双代币经济模型 • 🤝 团队协作增益 • ⚠️ 退出惩罚机制 • 🔗
                区块链透明记录
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/leaderboard">
                  <Button size="lg" className="gap-2">
                    加入团队
                    <ArrowRightIcon className="w-4 h-4" />
                  </Button>
                </Link>
                 
                <Link
                  href="https://github.com/machiwachi/intensivesquad"
                  target="_blank"
                >
                  <Button variant="secondary" size="lg" className="gap-2">
                    <SiRefinedgithub className="w-4 h-4" />
                    GitHub
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="fade-in-card p-6 bg-card border-2 border-foreground shadow-[8px_8px_0px_0px_theme(colors.foreground)] rotate-2">
                  <div className="text-3xl font-bold mb-2">💎 IDO</div>
                  <div className="text-lg text-card-foreground font-medium">
                    个人贡献代币
                  </div>
                  <div className="text-card-foreground/70 mt-1">
                    完成学习任务获得，链上记录、不可篡改，量化个人努力。
                  </div>
                </Card>
                <Card className="fade-in-card p-6 bg-accent border-2 border-foreground shadow-[8px_8px_0px_0px_theme(colors.foreground)] -rotate-1 mt-8">
                  <div className="text-3xl font-bold mb-2">🏅 WEDO</div>
                  <div className="text-lg text-accent-foreground font-medium">
                    团队增益代币
                  </div>
                  <div className="text-accent-foreground/70 mt-1">
                    团队成员获得IDO时，团队按比例获得WEDO，反映团队健康度，可兑换为IDO。
                  </div>
                </Card>
              </div>
              <div className="animate-[spin_3s_ease-in-out_infinite] absolute -top-4 -right-4 w-16 h-16  rotate-45 flex items-center justify-center text-2xl">
                <PiStarFourFill className="w-16 h-16 fill-neo-yellow stroke-12 stroke-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-neo-yellow/20">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <div className="flex flex-col items-center gap-3">
              <Badge className="bg-primary text-primary-foreground font-bold px-4 py-2 text-sm rotate-1">
                动态汇率
              </Badge>
              <h2 className="text-5xl font-semibold text-center text-foreground">
                团队规模越大，挣的越多！
              </h2>
              <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto font-[family-name:var(--font-dm-sans)] mt-2">
                汇率根据团队规模和当前活动赛季决定，坚持越久，团队越大，付出越有收获！
              </p>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 font-black bg-primary border-2 border-foreground flex items-center justify-center text-2xl rotate-3">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    加入学习团队
                  </h3>
                  <p className="text-muted-foreground">
                    选择你感兴趣的学习方向，加入3-8人的小团队，开始残酷共学之旅。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="font-black text-white/80 w-12 h-12 bg-emerald-500 border-2 border-foreground flex items-center justify-center text-2xl -rotate-3">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    完成学习任务
                  </h3>
                  <p className="text-muted-foreground">
                    每日打卡、提交作业、参与讨论，获得IDO个人贡献代币奖励。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="font-black text-white/80 w-12 h-12 bg-destructive border-2 border-foreground flex items-center justify-center text-2xl rotate-6">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    团队协作增益
                  </h3>
                  <p className="text-muted-foreground">
                    团队成员越活跃，WEDO兑换IDO的汇率越高，大家一起获得更多收益！
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="fade-in-card p-8 bg-background border-4 border-foreground shadow-[12px_12px_0px_0px_theme(colors.foreground)] rotate-1">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    动态汇率系统
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-card rounded border-2 border-foreground">
                      <span className="font-medium">团队规模 3人</span>
                      <span className="font-bold text-primary">1.2x 倍率</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-card rounded border-2 border-foreground">
                      <span className="font-medium">团队规模 5人</span>
                      <span className="font-bold text-primary">1.8x 倍率</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-card rounded border-2 border-foreground">
                      <span className="font-medium">团队规模 8人</span>
                      <span className="font-bold text-primary">2.5x 倍率</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-neo-green/20">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <div className="flex flex-col items-center gap-3">
              <Badge className="bg-destructive text-destructive-foreground font-bold px-4 py-2 text-sm rotate-1">
                核心机制
              </Badge>
              <h2 className="text-5xl font-semibold text-center text-foreground">
                核心机制
              </h2>
              <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto font-[family-name:var(--font-dm-sans)] mt-2">
                以链上透明激励，驱动每一位成员高效协作、持续成长。
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="fade-in-card p-8 bg-background border-4 border-foreground shadow-[12px_12px_0px_0px_theme(colors.foreground)] -rotate-1">
              <div className="w-12 h-12 bg-primary border-2 border-foreground mb-6 rotate-12 flex items-center justify-center text-2xl">
                🤝
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground font-[family-name:var(--font-space-grotesk)]">
                团队增益机制
              </h3>
              <p className="text-muted-foreground mb-4">
                团队越团结，WEDO 兑换 IDO 汇率越高，大家收益倍增！
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 团队规模越大，倍率越高</li>
                <li>• 成员活跃度影响整体收益</li>
                <li>• 最高可达 3x 增益倍率</li>
              </ul>
            </Card>
            <Card className="fade-in-card p-8 bg-background border-4 border-foreground shadow-[12px_12px_0px_0px_theme(colors.foreground)] rotate-1">
              <div className="w-12 h-12 bg-destructive border-2 border-foreground mb-6 -rotate-12 flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground font-[family-name:var(--font-space-grotesk)]">
                退出惩罚机制
              </h3>
              <p className="text-muted-foreground mb-4">
                提前退出会拉低团队兑换率，影响所有成员，退出需谨慎。
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 退出者失去部分已获得积分</li>
                <li>• 团队整体倍率下降</li>
                <li>• 鼓励坚持完成学习计划</li>
              </ul>
            </Card>
            <Card className="fade-in-card p-8 bg-background border-4 border-foreground shadow-[12px_12px_0px_0px_theme(colors.foreground)] -rotate-1">
              <div className="w-12 h-12 bg-accent border-2 border-foreground mb-6 rotate-45 flex items-center justify-center text-2xl">
                🔗
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground font-[family-name:var(--font-space-grotesk)]">
                区块链透明
              </h3>
              <p className="text-muted-foreground mb-4">
                所有数据上链，公开透明，每一份贡献都被精准记录。
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 智能合约自动执行规则</li>
                <li>• 所有交易公开可查</li>
                <li>• 防止作弊和数据篡改</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* IDO Pool & ETH Staking Section */}
      <section className="py-20 bg-neo-pink/40">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <div className="flex flex-col items-center gap-3">
              <Badge className="bg-primary text-primary-foreground font-bold px-4 py-2 text-sm rotate-1">
                $IDO 用处
              </Badge>
              <h2 className="text-5xl font-semibold text-center text-foreground">
                为了学好这一把！我愿意
                <span className="bg-destructive text-destructive-foreground px-2 -rotate-2 inline-block relative">
                  押上一切！
                </span>
              </h2>
              <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto font-[family-name:var(--font-dm-sans)] mt-2">
                加入时质押 ETH，活动结束时按 IDO 持有量分配奖池
              </p>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <Badge className="bg-primary text-primary-foreground font-bold px-4 py-2 text-sm rotate-1">
                  🔥 高风险高收益
                </Badge>
              </div>
              <h3 className="text-3xl font-bold mb-6 text-foreground font-[family-name:var(--font-space-grotesk)]">
                质押 ETH，按 IDO 持有量分配奖池
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary border-2 border-foreground flex items-center justify-center text-lg rotate-3">
                    💎
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">质押机制</h4>
                    <p className="text-muted-foreground text-sm">
                      参与活动需质押 0.3
                      ETH（可配置），直接进入公共奖池，活动结束前不可取回
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent border-2 border-foreground flex items-center justify-center text-lg -rotate-3">
                    📊
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">分配规则</h4>
                    <p className="text-muted-foreground text-sm">
                      结算时按各地址 IDO 持有量占比分配 ETH 奖池，持币即权益
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-destructive border-2 border-foreground flex items-center justify-center text-lg rotate-6">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">退出风险</h4>
                    <p className="text-muted-foreground text-sm">
                      被淘汰或主动退出的质押不退还，激励坚持到底
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="fade-in-card p-8 bg-card border-4 border-foreground shadow-[12px_12px_0px_0px_theme(colors.foreground)] rotate-2">
                <div className="text-center">
                  <div className="text-5xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold mb-6 text-card-foreground">
                    奖池分配示例
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-background p-4 rounded border-2 border-foreground">
                      <div className="text-lg font-bold mb-2">
                        总奖池: 12.5 ETH
                      </div>
                      <div className="text-sm text-muted-foreground">
                        25人 × 0.5 ETH 质押
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-background rounded border border-foreground">
                        <span className="text-sm">持有 1000 IDO (20%)</span>
                        <span className="font-bold text-primary">2.5 ETH</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-background rounded border border-foreground">
                        <span className="text-sm">持有 500 IDO (10%)</span>
                        <span className="font-bold text-accent">1.25 ETH</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-background rounded border border-foreground">
                        <span className="text-sm">持有 250 IDO (5%)</span>
                        <span className="font-bold text-muted-foreground">
                          0.625 ETH
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary border-2 border-foreground rotate-45 flex items-center justify-center text-xl">
                💰
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WEDO Store (Team Shrine) Section */}
      <section className="py-20 bg-blue-300/40">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <div className="flex flex-col items-center gap-3">
              <Badge className="bg-neo-green text-neo-black font-bold px-4 py-2 text-sm rotate-1">
                $WEDO 用处
              </Badge>
              <h2 className="text-5xl font-semibold text-center text-foreground">
                游戏化！没有点
                <span className="bg-primary-hover text-primary-foreground px-2 rotate-2 inline-block relative">
                  道具
                </span>
                怎么行？
              </h2>
              <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto font-[family-name:var(--font-dm-sans)] mt-2">
                在道具商店使用团队 WEDO
                代币购买战略道具，增强团队协作能力，获得竞争优势。
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 激励增强类 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center text-foreground font-[family-name:var(--font-space-grotesk)] flex items-center justify-center gap-2">
                ⚡ 激励增强类
              </h3>
              <div className="space-y-4">
                <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[6px_6px_0px_0px_theme(colors.foreground)] rotate-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🌟</div>
                    <div>
                      <h4 className="font-bold text-foreground">团队之光</h4>
                      <div className="text-xs font-bold">50 WEDO</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    临时提升团队倍率 +0.5x，持续 7 天
                  </p>
                </Card>

                <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[6px_6px_0px_0px_theme(colors.foreground)] -rotate-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🔥</div>
                    <div>
                      <h4 className="font-bold text-foreground">学习狂热</h4>
                      <div className="text-xs font-bold">80 WEDO</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    团队积分效率 +20%，持续 5 天
                  </p>
                </Card>

                <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[6px_6px_0px_0px_theme(colors.foreground)] rotate-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🛡️</div>
                    <div>
                      <h4 className="font-bold text-foreground">凝聚力护盾</h4>
                      <div className="text-xs font-bold">120 WEDO</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    保护一名成员免受淘汰，一次性使用
                  </p>
                </Card>
              </div>
            </div>

            {/* 复活重生类 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center text-foreground font-[family-name:var(--font-space-grotesk)] flex items-center justify-center gap-2">
                🔄 复活重生类
              </h3>
              <div className="space-y-4">
                <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[6px_6px_0px_0px_theme(colors.foreground)] -rotate-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">📯</div>
                    <div>
                      <h4 className="font-bold text-foreground">重聚号角</h4>
                      <div className="text-xs text-accent font-bold">
                        200 WEDO
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    召回一名已淘汰的团队成员
                  </p>
                </Card>

                <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[6px_6px_0px_0px_theme(colors.foreground)] rotate-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🧬</div>
                    <div>
                      <h4 className="font-bold text-foreground">血脉传承</h4>
                      <div className="text-xs text-accent font-bold">
                        150 WEDO
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    恢复团队倍率的 70% 水平
                  </p>
                </Card>

                <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[6px_6px_0px_0px_theme(colors.foreground)] -rotate-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🌱</div>
                    <div>
                      <h4 className="font-bold text-foreground">新生之种</h4>
                      <div className="text-xs text-accent font-bold">
                        300 WEDO
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    重置团队规模，重新开始计算
                  </p>
                </Card>
              </div>
            </div>

            {/* 战略对抗类 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center text-foreground font-[family-name:var(--font-space-grotesk)] flex items-center justify-center gap-2">
                ⚔️ 战略对抗类
              </h3>
              <div className="space-y-4">
                <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[6px_6px_0px_0px_theme(colors.foreground)] rotate-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🏅</div>
                    <div>
                      <h4 className="font-bold text-foreground">挑战徽章</h4>
                      <div className="text-xs text-destructive font-bold">
                        100 WEDO
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    向其他团队发起友谊挑战赛
                  </p>
                </Card>

                <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[6px_6px_0px_0px_theme(colors.foreground)] -rotate-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🔍</div>
                    <div>
                      <h4 className="font-bold text-foreground">侦查卷轴</h4>
                      <div className="text-xs text-destructive font-bold">
                        60 WEDO
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    查看其他团队的积分和倍率
                  </p>
                </Card>

                <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[6px_6px_0px_0px_theme(colors.foreground)] rotate-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🎵</div>
                    <div>
                      <h4 className="font-bold text-foreground">鼓舞战歌</h4>
                      <div className="text-xs text-destructive font-bold">
                        90 WEDO
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    免疫其他团队的干扰效果
                  </p>
                </Card>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Card className="fade-in-card p-8 bg-background border-4 border-foreground shadow-[12px_12px_0px_0px_theme(colors.foreground)] inline-block rotate-1">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                团队决策机制
              </h3>
              <div className="space-y-2 text-left">
                <p className="text-sm text-muted-foreground">
                  • 重要道具需团队投票 (&gt;50% 同意)
                </p>
                <p className="text-sm text-muted-foreground">
                  • 部分道具有冷却时间和使用次数限制
                </p>
                <p className="text-sm text-muted-foreground">
                  • 道具效果实时可视化展示
                </p>
                <p className="text-sm text-muted-foreground">
                  • 分层价格体系保持游戏平衡
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-center mb-12 text-foreground">
            📈 平台数据
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="fade-in-card text-center">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-5xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">
                1,247
              </div>
              <div className="text-muted-foreground font-medium">活跃学员</div>
              <div className="text-xs text-muted-foreground/70 mt-1">
                Active Learners
              </div>
            </div>
            <div className="fade-in-card text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-5xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">
                89
              </div>
              <div className="text-muted-foreground font-medium">活跃团队</div>
              <div className="text-xs text-muted-foreground/70 mt-1">
                Active Teams
              </div>
            </div>
            <div className="fade-in-card text-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-5xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">
                95%
              </div>
              <div className="text-muted-foreground font-medium">完成率</div>
              <div className="text-xs text-muted-foreground/70 mt-1">
                Completion Rate
              </div>
            </div>
            <div className="fade-in-card text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-5xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">
                2.4x
              </div>
              <div className="text-muted-foreground font-medium">平均增益</div>
              <div className="text-xs text-muted-foreground/70 mt-1">
                Average Multiplier
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-neo-green/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-3">
            <Badge className="bg-primary text-primary-foreground font-bold px-4 py-2 text-sm rotate-1">
              学员反馈
            </Badge>
            <h2 className="text-5xl font-semibold text-center text-foreground">
              夸夸团
              <span className="bg-secondary text-secondary-foreground px-2 -rotate-2 inline-block relative">
                (并不是托
              </span>
            </h2>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto font-[family-name:var(--font-dm-sans)] mt-2">
              大家说好才是真的好
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[8px_8px_0px_0px_theme(colors.foreground)] rotate-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary border-2 border-foreground rounded-full flex items-center justify-center text-lg">
                  👨‍💻
                </div>
                <div>
                  <div className="font-bold text-foreground">张同学</div>
                  <div className="text-sm text-muted-foreground">
                    前端开发团队
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "团队机制让我更有动力坚持学习，不想拖累队友！最终获得了2.3倍的积分增益。"
              </p>
            </Card>
            <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[8px_8px_0px_0px_theme(colors.foreground)] -rotate-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent border-2 border-foreground rounded-full flex items-center justify-center text-lg">
                  👩‍🎨
                </div>
                <div>
                  <div className="font-bold text-foreground">李设计师</div>
                  <div className="text-sm text-muted-foreground">
                    UI/UX 设计团队
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "透明的积分系统让我看到每一份努力都有回报，团队协作的感觉太棒了！"
              </p>
            </Card>
            <Card className="fade-in-card p-6 bg-background border-2 border-foreground shadow-[8px_8px_0px_0px_theme(colors.foreground)] rotate-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-destructive border-2 border-foreground rounded-full flex items-center justify-center text-lg">
                  👨‍🔬
                </div>
                <div>
                  <div className="font-bold text-foreground">王工程师</div>
                  <div className="text-sm text-muted-foreground">
                    区块链开发团队
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "从来没有这么认真地完成过一个学习计划，惩罚机制真的很有效！"
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <RxRocket className="text-6xl stroke-primary-foreground" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 font-[family-name:var(--font-space-grotesk)]">
            准备好接受挑战了吗？
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            💪 加入我们，与优秀队友并肩前行，把汗水变成荣耀！🏆
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg px-12 py-4 border-2 border-primary-foreground shadow-[6px_6px_0px_0px_theme(colors.primary.foreground)]"
            >
              🎯 立即开始
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:font-bold text-lg px-12 py-4 shadow-[6px_6px_0px_0px_theme(colors.primary.foreground)] bg-transparent"
            >
              📋 查看白皮书
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-accent rotate-12 "></div>
              <span className="font-bold font-[family-name:var(--font-space-grotesk)]">
                残酷小队
              </span>
            </div>
            <div className="flex space-x-6">
              <Link href="#">
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:text-accent transition-colors flex items-center gap-1"
                >
                  <GiftIcon className="w-4 h-4" />
                  关于我们
                </Button>
              </Link>
              <Link href="https://github.com/machiwachi" target="_blank">
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:text-accent transition-colors flex items-center gap-1"
                >
                  <ArrowRightIcon className="w-4 h-4" />
                  联系方式
                </Button>
              </Link>
              <Link
                href="https://github.com/machiwachi/intensivesquad"
                target="_blank"
              >
                <Button variant="outline" size="icon" className="font-light">
                  <SiRefinedgithub className="w-4 h-4" />
                  Github
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t-2 border-background/40 text-center text-sm text-background/70">
            <p>
              🔗 基于区块链技术的去中心化学习激励平台 | Built with ❤️ for
              learners worldwide
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
