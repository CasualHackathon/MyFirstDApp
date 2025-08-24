"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/retroui/Card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Users,
  Coins,
  Clock,
  Wallet,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ExternalLink,
  Share,
  DollarSign,
} from "lucide-react";

export default function IDOPoolDashboard() {
  const [stakeAmount, setStakeAmount] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Mock data based on the specifications
  const poolData = {
    totalETH: 230,
    participants: 76,
    endDate: "2025/09/01",
    minStake: 0.3,
    userIDO: 20,
    totalIDO: 3800,
    estimatedReward: 1.21,
    userStaked: 0.3,
    canClaim: true,
    poolStatus: "active", // active, ended, claiming
  };

  const topParticipants = [
    { address: "0x1234...5678", ido: 45, reward: 2.72 },
    { address: "0x9abc...def0", ido: 38, reward: 2.31 },
    { address: "0x5678...9abc", ido: 32, reward: 1.95 },
    { address: "0xdef0...1234", ido: 28, reward: 1.7 },
    { address: "0x2468...ace0", ido: 25, reward: 1.52 },
  ];

  const handleConnectWallet = () => {
    setIsConnected(!isConnected);
  };

  const handleStake = () => {
    if (stakeAmount && Number.parseFloat(stakeAmount) >= poolData.minStake) {
      // Handle staking logic
      console.log("Staking:", stakeAmount, "ETH");
    }
  };

  const handleClaim = () => {
    // Handle claiming logic
    console.log("Claiming rewards");
  };

  return (
    <div className="bg-background">
      {/* Header */}

      <div className="mx-auto py-8 space-y-8">
        {/* Hero Section */}

        {/* Main Pool Stats */}
        <Card className="w-full relative">
          <div className="absolute -top-4 -right-4 bg-black text-primary px-4 py-1 font-bold">
            还有 9 天
          </div>
          <CardHeader className="text-center border-b-2 bg-primary">
            <CardTitle className="flex items-baseline justify-center font-sans">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black">
                  <Trophy className="w-6 h-6" />
                </span>
                <span className="text-6xl font-black">{poolData.totalETH}</span>
                <span className="text-xl font-black">ETH</span>
              </div>
            </CardTitle>

            <CardDescription className="text-lg text-black/80 font-bold">
              当前奖池总额
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {poolData.participants}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">参与者</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{poolData.endDate}</span>
                </div>
                <p className="text-sm text-muted-foreground">结算时间</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Coins className="w-5 h-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {poolData.minStake} ETH
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">最低质押</p>
              </div>
            </div>
          </CardContent>

          <CardContent className="border-t-2 bg-retro-lime">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Coins className="w-5 h-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {poolData.totalIDO.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">总 IDO</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Share className="w-5 h-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {Math.round(poolData.totalIDO / poolData.participants)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">平均每人 IDO</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {(poolData.totalETH / poolData.participants).toFixed(3)} ETH
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">平均预估奖励</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Pool Overview */}
          <div className="lg:col-span-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>参与者总览</span>
                </CardTitle>
                <CardDescription>
                  按 IDO 持仓排序的参与者列表（地址已脱敏）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topParticipants.map((participant, index) => (
                    <div
                      key={participant.address}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant="secondary"
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-mono text-sm">
                            {participant.address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {participant.ido} IDO
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {participant.reward} ETH
                        </p>
                        <p className="text-xs text-muted-foreground">
                          预估奖励
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-accent mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-accent">预估值说明</p>
                      <p className="text-muted-foreground">
                        预估奖励会随奖池与 IDO
                        总量变化而变动，最终以结算快照为准。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - User Panel */}
          <div className="space-y-6">
            <Card className="border-primary w-full">
              <CardHeader>
                <CardTitle className="">我的面板</CardTitle>
                <CardDescription>个人持仓与奖励信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      我的 IDO
                    </span>
                    <span className="font-bold text-lg">
                      {poolData.userIDO}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      已质押
                    </span>
                    <span className="font-bold text-lg">
                      {poolData.userStaked} ETH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      预估奖励
                    </span>
                    <span className="font-bold text-lg text-primary">
                      {poolData.estimatedReward} ETH
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>我的份额</span>
                    <span>
                      {((poolData.userIDO / poolData.totalIDO) * 100).toFixed(
                        2
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(poolData.userIDO / poolData.totalIDO) * 100}
                    className="h-2"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>活动状态：</strong>进行中
                    </p>
                    <p>
                      <strong>我的状态：</strong>已参与
                    </p>
                    <p>
                      <strong>下次结算：</strong>
                      {poolData.endDate}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    asChild
                  >
                    <a href="#" className="flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>查看详细规则</span>
                    </a>
                  </Button>
                </div>

                {poolData.canClaim && (
                  <Button onClick={handleClaim} className="w-full" size="lg">
                    领取 {poolData.estimatedReward} ETH
                  </Button>
                )}

                <div className="text-xs text-muted-foreground text-center">
                  结算后在此处出现领取按钮
                </div>
              </CardContent>
            </Card>

            {/* Rules Section */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>规则说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      <span>奖池来源</span>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      成员质押与赞助累计
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <ArrowDownRight className="w-4 h-4 text-blue-500" />
                      <span>分配规则</span>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      按结算快照的 IDO 权重分配
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>参与条件：</strong>质押 {poolData.minStake} ETH
                    加入活动
                  </p>
                  <p>
                    <strong>退出处理：</strong>退出或被淘汰的质押按平台规则处理
                  </p>
                  <p>
                    <strong>结算时间：</strong>
                    {poolData.endDate}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
