"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList,
  TabsPanels,
} from "@/components/retroui/Tab";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Zap,
  Shield,
  Heart,
  Sword,
  Eye,
  Clock,
  Users,
  Trophy,
  Target,
  Calendar,
  Star,
  Coins,
  History,
  Package,
  Play,
  Pause,
  RotateCcw,
  Vote,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

// Mock data for WEDO store items
const storeItems = {
  boost: [
    {
      id: 1,
      name: "团队之光",
      nameEn: "Team Light",
      description: "临时提升团队 L 值 +0.2",
      duration: "24小时",
      price: 150,
      icon: Sparkles,
      rarity: "common",
      effect: "+0.2 Team L Value",
      cooldown: 0,
      maxStack: 3,
    },
    {
      id: 2,
      name: "学习狂热",
      nameEn: "Learning Frenzy",
      description: "提升全队活动积分获取效率 +20%",
      duration: "48小时",
      price: 200,
      icon: Zap,
      rarity: "uncommon",
      effect: "+20% Activity Points",
      cooldown: 24,
      maxStack: 2,
    },
    {
      id: 3,
      name: "凝聚力护盾",
      nameEn: "Unity Shield",
      description: "成员48小时内免疫淘汰",
      duration: "48小时",
      price: 500,
      icon: Shield,
      rarity: "rare",
      effect: "Elimination Immunity",
      cooldown: 72,
      maxStack: 1,
    },
  ],
  revival: [
    {
      id: 4,
      name: "重聚号角",
      nameEn: "Reunion Horn",
      description: "召回1名最近被淘汰的成员",
      duration: "立即生效",
      price: 800,
      icon: Heart,
      rarity: "epic",
      effect: "Revive 1 Member",
      cooldown: 168,
      maxStack: 1,
    },
    {
      id: 5,
      name: "血脉传承",
      nameEn: "Bloodline Legacy",
      description: "恢复团队L值至淘汰前水平",
      duration: "立即生效",
      price: 1200,
      icon: Heart,
      rarity: "epic",
      effect: "Restore Team L Value",
      cooldown: 168,
      maxStack: 1,
    },
  ],
  strategy: [
    {
      id: 6,
      name: "挑战徽章",
      nameEn: "Challenge Badge",
      description: "对指定团队发起学习挑战",
      duration: "7天",
      price: 300,
      icon: Sword,
      rarity: "uncommon",
      effect: "Team Challenge",
      cooldown: 48,
      maxStack: 2,
    },
    {
      id: 7,
      name: "侦查卷轴",
      nameEn: "Scout Scroll",
      description: "查看指定团队的当前状态",
      duration: "24小时",
      price: 100,
      icon: Eye,
      rarity: "common",
      effect: "Team Intelligence",
      cooldown: 12,
      maxStack: 5,
    },
  ],
};

const teamInventory = [
  { itemId: 1, quantity: 2, lastUsed: null, cooldownRemaining: 0 },
  {
    itemId: 2,
    quantity: 1,
    lastUsed: "2024-01-09 10:00",
    cooldownRemaining: 8,
  },
  { itemId: 7, quantity: 3, lastUsed: null, cooldownRemaining: 0 },
  { itemId: 3, quantity: 1, lastUsed: null, cooldownRemaining: 0 },
];

// Mock data for team dashboard
const teamMembers = [
  {
    id: 1,
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    points: 450,
    streak: 7,
    role: "leader",
  },
  {
    id: 2,
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    points: 380,
    streak: 5,
    role: "member",
  },
  {
    id: 3,
    name: "王五",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    points: 320,
    streak: 3,
    role: "member",
  },
  {
    id: 4,
    name: "赵六",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "warning",
    points: 180,
    streak: 1,
    role: "member",
  },
  {
    id: 5,
    name: "钱七",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "eliminated",
    points: 0,
    streak: 0,
    role: "member",
  },
];

const teamChallenges = [
  {
    id: 1,
    challenger: "凤凰队",
    type: "learning",
    status: "active",
    reward: 500,
    deadline: "2024-01-15",
  },
  {
    id: 2,
    challenger: "雄鹰队",
    type: "collaboration",
    status: "pending",
    reward: 300,
    deadline: "2024-01-20",
  },
];

const activeEffects = [
  {
    name: "学习狂热",
    effect: "+20% 积分效率",
    remaining: "36小时",
    type: "boost",
  },
  {
    name: "凝聚力护盾",
    effect: "淘汰免疫",
    remaining: "12小时",
    type: "protection",
  },
];

const rarityColors = {
  common: "bg-gray-100 text-gray-800 border-gray-200",
  uncommon: "bg-green-100 text-green-800 border-green-200",
  rare: "bg-blue-100 text-blue-800 border-blue-200",
  epic: "bg-purple-100 text-purple-800 border-purple-200",
  legendary: "bg-orange-100 text-orange-800 border-orange-200",
};

// Mock data for token economy system
const tokenTransactions = [
  {
    id: 1,
    type: "earn",
    amount: 50,
    source: "每日打卡",
    timestamp: "2024-01-10 09:00",
    member: "张三",
  },
  {
    id: 2,
    type: "earn",
    amount: 100,
    source: "完成任务",
    timestamp: "2024-01-10 14:30",
    member: "李四",
  },
  {
    id: 3,
    type: "spend",
    amount: 150,
    source: "购买团队之光",
    timestamp: "2024-01-10 16:45",
    member: "团队购买",
  },
  {
    id: 4,
    type: "earn",
    amount: 200,
    source: "团队挑战胜利",
    timestamp: "2024-01-09 20:00",
    member: "团队奖励",
  },
  {
    id: 5,
    type: "transfer",
    amount: 75,
    source: "成员转账",
    timestamp: "2024-01-09 11:15",
    member: "王五 → 赵六",
  },
];

const tokenEarningRules = [
  {
    activity: "每日打卡",
    reward: "50 WEDO",
    frequency: "每天",
    icon: Calendar,
  },
  {
    activity: "完成学习任务",
    reward: "100-200 WEDO",
    frequency: "每任务",
    icon: Target,
  },
  {
    activity: "团队挑战胜利",
    reward: "200-500 WEDO",
    frequency: "每次",
    icon: Trophy,
  },
  {
    activity: "邀请新成员",
    reward: "300 WEDO",
    frequency: "每人",
    icon: Users,
  },
  {
    activity: "连续打卡奖励",
    reward: "额外 50% WEDO",
    frequency: "7天+",
    icon: Star,
  },
];

const weeklyTokenStats = {
  earned: 1250,
  spent: 800,
  transferred: 150,
  balance: 2450,
  weeklyLimit: 2000,
  dailyEarned: 180,
  dailyLimit: 300,
};

const teamVotes = [
  {
    id: 1,
    title: "购买凝聚力护盾",
    description: "团队提议购买凝聚力护盾道具，价格500 WEDO",
    type: "purchase",
    itemId: 3,
    cost: 500,
    status: "active",
    createdBy: "张三",
    createdAt: "2024-01-10 15:30",
    deadline: "2024-01-11 15:30",
    requiredVotes: 3,
    votes: [
      {
        memberId: 1,
        memberName: "张三",
        vote: "yes",
        timestamp: "2024-01-10 15:30",
      },
      {
        memberId: 2,
        memberName: "李四",
        vote: "yes",
        timestamp: "2024-01-10 16:15",
      },
      {
        memberId: 3,
        memberName: "王五",
        vote: "no",
        timestamp: "2024-01-10 17:00",
      },
    ],
  },
  {
    id: 2,
    title: "接受凤凰队挑战",
    description: "是否接受来自凤凰队的学习挑战，奖励500 WEDO",
    type: "challenge",
    challengeId: 1,
    status: "active",
    createdBy: "李四",
    createdAt: "2024-01-10 10:00",
    deadline: "2024-01-11 10:00",
    requiredVotes: 3,
    votes: [
      {
        memberId: 2,
        memberName: "李四",
        vote: "yes",
        timestamp: "2024-01-10 10:00",
      },
      {
        memberId: 1,
        memberName: "张三",
        vote: "yes",
        timestamp: "2024-01-10 11:30",
      },
    ],
  },
  {
    id: 3,
    title: "团队策略调整",
    description: "调整团队学习重点，专注于技术挑战项目",
    type: "strategy",
    status: "completed",
    result: "passed",
    createdBy: "张三",
    createdAt: "2024-01-09 14:00",
    deadline: "2024-01-10 14:00",
    requiredVotes: 3,
    votes: [
      {
        memberId: 1,
        memberName: "张三",
        vote: "yes",
        timestamp: "2024-01-09 14:00",
      },
      {
        memberId: 2,
        memberName: "李四",
        vote: "yes",
        timestamp: "2024-01-09 15:20",
      },
      {
        memberId: 3,
        memberName: "王五",
        vote: "yes",
        timestamp: "2024-01-09 16:45",
      },
      {
        memberId: 4,
        memberName: "赵六",
        vote: "no",
        timestamp: "2024-01-09 18:00",
      },
    ],
  },
];

const voteTypeConfig = {
  purchase: { threshold: 0.6, icon: Package, color: "blue" },
  challenge: { threshold: 0.5, icon: Sword, color: "red" },
  strategy: { threshold: 0.6, icon: Target, color: "green" },
  revival: { threshold: 0.8, icon: Heart, color: "purple" },
};

const ItemCard = ({
  item,
  isInventory = false,
  inventoryData = null,
}: {
  item: any;
  isInventory?: boolean;
  inventoryData?: any;
}) => {
  const IconComponent = item.icon;
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showUseDialog, setShowUseDialog] = useState(false);
  const [showVoteDialog, setShowVoteDialog] = useState(false);

  const canUse =
    isInventory && inventoryData && inventoryData.cooldownRemaining === 0;
  const canPurchase = !isInventory && weeklyTokenStats.balance >= item.price;
  const requiresVote = !isInventory && item.price >= 300; // Items over 300 WEDO require team vote

  const handlePurchase = () => {
    console.log(`[v0] Purchasing item: ${item.name} for ${item.price} WEDO`);
    setShowPurchaseDialog(false);
    // Here would be the actual purchase logic
  };

  const handleUse = () => {
    console.log(`[v0] Using item: ${item.name}`);
    setShowUseDialog(false);
    // Here would be the actual usage logic
  };

  const handleCreateVote = () => {
    console.log(`[v0] Creating vote for item purchase: ${item.name}`);
    setShowVoteDialog(false);
    // Here would be the vote creation logic
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2  bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-playfair">
                  {item.name}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {item.nameEn}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge
                className={`${
                  rarityColors[item.rarity as keyof typeof rarityColors]
                } border`}
              >
                {item.rarity}
              </Badge>
              {isInventory && inventoryData && (
                <Badge variant="outline" className="text-xs">
                  x{inventoryData.quantity}
                </Badge>
              )}
              {requiresVote && (
                <Badge
                  variant="outline"
                  className="text-xs bg-orange-50 text-orange-600 border-orange-200"
                >
                  需要投票
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground/80">{item.description}</p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{item.duration}</span>
          </div>

          {isInventory &&
            inventoryData &&
            inventoryData.cooldownRemaining > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <RotateCcw className="h-4 w-4" />
                <span>冷却中: {inventoryData.cooldownRemaining}小时</span>
              </div>
            )}

          <div className="p-3 bg-retro-lime">
            <div className="text-sm font-medium text-accent-foreground mb-1">
              效果
            </div>
            <div className="text-sm">{item.effect}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>冷却: {item.cooldown}小时</div>
            <div>最大叠加: {item.maxStack}</div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {!isInventory ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">W</span>
                  </div>
                  <span className="font-semibold text-lg">{item.price}</span>
                </div>
                {requiresVote ? (
                  <Dialog
                    open={showVoteDialog}
                    onOpenChange={setShowVoteDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={!canPurchase}
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        发起投票
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>发起团队投票</DialogTitle>
                        <DialogDescription>
                          购买 {item.name}{" "}
                          需要团队投票决定，需要超过60%的成员同意。
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowVoteDialog(false)}
                        >
                          取消
                        </Button>
                        <Button onClick={handleCreateVote}>创建投票</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Dialog
                    open={showPurchaseDialog}
                    onOpenChange={setShowPurchaseDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={!canPurchase}
                      >
                        购买
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>确认购买</DialogTitle>
                        <DialogDescription>
                          确定要花费 {item.price} WEDO 购买 {item.name} 吗？
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowPurchaseDialog(false)}
                        >
                          取消
                        </Button>
                        <Button onClick={handlePurchase}>确认购买</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            ) : (
              <div className="w-full">
                <Dialog open={showUseDialog} onOpenChange={setShowUseDialog}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={!canUse}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {canUse ? "使用道具" : "冷却中"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>使用道具</DialogTitle>
                      <DialogDescription>
                        确定要使用 {item.name} 吗？使用后将进入 {item.cooldown}{" "}
                        小时冷却期。
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowUseDialog(false)}
                      >
                        取消
                      </Button>
                      <Button onClick={handleUse}>确认使用</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default function WEDOStore() {
  const [userVote, setUserVote] = useState<{ [key: number]: string }>({});

  const getAllStoreItems = () => {
    return [...storeItems.boost, ...storeItems.revival, ...storeItems.strategy];
  };

  const getInventoryItems = () => {
    const allItems = getAllStoreItems();
    return teamInventory
      .map((invItem) => {
        const item = allItems.find(
          (storeItem) => storeItem.id === invItem.itemId
        );
        return { ...item, inventoryData: invItem };
      })
      .filter(Boolean);
  };

  const handleVote = (voteId: number, vote: string) => {
    console.log(`[v0] Voting ${vote} on vote ${voteId}`);
    setUserVote((prev) => ({ ...prev, [voteId]: vote }));
    // Here would be the actual voting logic
  };

  const getVoteProgress = (vote: any) => {
    const totalEligibleMembers = teamMembers.filter(
      (m) => m.status === "active"
    ).length;
    const yesVotes = vote.votes.filter((v: any) => v.vote === "yes").length;
    const noVotes = vote.votes.filter((v: any) => v.vote === "no").length;
    const totalVotes = vote.votes.length;

    const config = voteTypeConfig[vote.type as keyof typeof voteTypeConfig];
    const requiredYes = Math.ceil(totalEligibleMembers * config.threshold);

    return {
      yesVotes,
      noVotes,
      totalVotes,
      totalEligibleMembers,
      requiredYes,
      yesPercentage: totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0,
      canPass: yesVotes >= requiredYes,
      hasUserVoted: vote.votes.some((v: any) => v.memberId === 1), // Assuming current user is member 1
    };
  };

  return (
    <div className="">
      {/* Header */}

      {/* Main Content */}
      <main className="mx-auto py-8">
        <Tabs className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-fit lg:grid-cols-7">
            <TabsTrigger value="voting" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              团队投票
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              道具库存
            </TabsTrigger>
            <TabsTrigger value="boost" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              激励增强
            </TabsTrigger>
            <TabsTrigger value="revival" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              复活重生
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2">
              <Sword className="h-4 w-4" />
              战略对抗
            </TabsTrigger>
          </TabsList>

          <TabsPanels>
            <TabsContent className="space-y-6">
              {/* Voting Overview */}
              <Card className="w-full bg-gradient-to-r from-primary/5 to-accent/5 ">
                <CardHeader>
                  <CardTitle className="font-playfair flex items-center gap-2">
                    <Vote className="h-5 w-5" />
                    团队投票系统
                  </CardTitle>
                  <CardDescription>
                    重要决策需要团队投票，不同类型的提案需要不同的通过门槛
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 border-2 rounded-md break-inside-avoid mb-6 flex items-center gap-3">
                      <Vote className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">进行中投票</p>
                        <p className="text-2xl font-bold">
                          {
                            teamVotes.filter((v) => v.status === "active")
                              .length
                          }
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 border-2 rounded-md break-inside-avoid mb-6 flex items-center gap-3 ">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">已通过</p>
                        <p className="text-2xl font-bold text-green-600">
                          {
                            teamVotes.filter(
                              (v) =>
                                v.status === "completed" &&
                                v.result === "passed"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 border-2 rounded-md break-inside-avoid mb-6 flex items-center gap-3  ">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">未通过</p>
                        <p className="text-2xl font-bold text-red-600">
                          {
                            teamVotes.filter(
                              (v) =>
                                v.status === "completed" &&
                                v.result === "failed"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 border-2 rounded-md break-inside-avoid mb-6 flex items-center gap-3  ">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">有效选民</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {
                            teamMembers.filter((m) => m.status === "active")
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Votes */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    进行中的投票
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teamVotes.filter((vote) => vote.status === "active").length >
                  0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {teamVotes
                        .filter((vote) => vote.status === "active")
                        .map((vote) => {
                          const progress = getVoteProgress(vote);
                          const config =
                            voteTypeConfig[
                              vote.type as keyof typeof voteTypeConfig
                            ];
                          const IconComponent = config.icon;

                          return (
                            <Card
                              key={vote.id}
                              className="w-full shadow-none hover:shadow-md"
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`p-2  bg-${config.color}-100`}
                                    >
                                      <IconComponent
                                        className={`h-5 w-5 text-${config.color}-600`}
                                      />
                                    </div>
                                    <div>
                                      <CardTitle className="text-lg">
                                        {vote.title}
                                      </CardTitle>
                                      <CardDescription>
                                        {vote.description}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="bg-orange-100 text-orange-600 border-orange-200"
                                  >
                                    {vote.type === "purchase"
                                      ? "购买决策"
                                      : vote.type === "challenge"
                                      ? "挑战决策"
                                      : vote.type === "strategy"
                                      ? "策略决策"
                                      : "复活决策"}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      发起人:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {vote.createdBy}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      截止时间:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {vote.deadline}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      需要票数:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {progress.requiredYes}/
                                      {progress.totalEligibleMembers}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>投票进度</span>
                                    <span className="font-medium">
                                      {progress.yesVotes} 赞成 /{" "}
                                      {progress.noVotes} 反对 /{" "}
                                      {progress.totalVotes} 总票数
                                    </span>
                                  </div>
                                  <Progress
                                    value={progress.yesPercentage}
                                    className="h-3"
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>
                                      需要 {config.threshold * 100}% 赞成票通过
                                    </span>
                                    <span>
                                      {progress.yesPercentage.toFixed(1)}% 赞成
                                    </span>
                                  </div>
                                </div>

                                {!progress.hasUserVoted ? (
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleVote(vote.id, "yes")}
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      赞成
                                    </Button>
                                    <Button
                                      onClick={() => handleVote(vote.id, "no")}
                                      variant="destructive"
                                      className="flex-1"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      反对
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="text-center p-3 bg-muted/50 ">
                                    <p className="text-sm text-muted-foreground">
                                      您已投票
                                    </p>
                                  </div>
                                )}

                                {/* Vote Details */}
                                <div className="border-t pt-3">
                                  <p className="text-sm font-medium mb-2">
                                    投票详情:
                                  </p>
                                  <div className="space-y-1">
                                    {vote.votes.map((v: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <span>{v.memberName}</span>
                                        <div className="flex items-center gap-2">
                                          {v.vote === "yes" ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                          ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                          )}
                                          <span className="text-xs text-muted-foreground">
                                            {v.timestamp}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">暂无进行中的投票</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vote History */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    投票历史
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamVotes
                      .filter((vote) => vote.status === "completed")
                      .map((vote) => {
                        const progress = getVoteProgress(vote);
                        const config =
                          voteTypeConfig[
                            vote.type as keyof typeof voteTypeConfig
                          ];
                        const IconComponent = config.icon;

                        return (
                          <div
                            key={vote.id}
                            className="flex items-center justify-between p-3  border-2 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2  bg-${config.color}-100`}>
                                <IconComponent
                                  className={`h-4 w-4 text-${config.color}-600`}
                                />
                              </div>
                              <div>
                                <p className="font-medium">{vote.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {vote.createdBy} · {vote.createdAt}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  vote.result === "passed"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {vote.result === "passed" ? "通过" : "未通过"}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {progress.yesVotes}赞成 / {progress.noVotes}反对
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6">
              <Card className="w-full bg-gradient-to-r from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="font-playfair flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    团队道具库存
                  </CardTitle>
                  <CardDescription>
                    管理和使用团队拥有的道具，注意冷却时间和使用限制
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-4 border-2 rounded-md break-inside-avoid mb-6 flex items-center gap-3  ">
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">总道具数</p>
                        <p className="text-2xl font-bold">
                          {teamInventory.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 border-2 rounded-md break-inside-avoid mb-6 flex items-center gap-3  ">
                      <Play className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">可用道具</p>
                        <p className="text-2xl font-bold text-green-600">
                          {teamInventory
                            .filter((item) => item.cooldownRemaining === 0)
                            .reduce((sum, item) => sum + item.quantity, 0)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 border-2 rounded-md break-inside-avoid mb-6 flex items-center gap-3  ">
                      <Pause className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">冷却中</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {
                            teamInventory.filter(
                              (item) => item.cooldownRemaining > 0
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {getInventoryItems().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getInventoryItems().map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isInventory={true}
                      inventoryData={item.inventoryData}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">暂无道具库存</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      前往商店购买道具来增强团队实力
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ... existing code for other tabs ... */}

            <TabsContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeItems.boost.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeItems.revival.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeItems.strategy.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
          </TabsPanels>
        </Tabs>
      </main>
    </div>
  );
}
