"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/retroui/Card";

import { Skeleton } from "@/components/ui/skeleton";
import { type Team } from "@/lib/typings";
import { formatEther } from "viem";
import { DividendVaultBlock } from "./dividend-vault.block";
import { MemberRing } from "./member-ring";
import { RankChange, RankIcon } from "./rank";
import { Sparkline } from "./sparkline";
import { formatTokenAmount } from "@/lib/utils";

export function ClanCard({
  clan,
  onClick,
}: {
  clan: Team;
  onClick: (clan: Team) => void;
}) {
  console.log(clan);
  return (
    <Card
      key={clan.id}
      className={`${clan.isUserTeam ? "ring-primary " : ""}`}
      onClick={() => onClick(clan)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{clan.flag}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                  {clan.name}
                </h3>
                {clan.isUserTeam && (
                  <Badge variant="default" className=" text-xs bg-primary">
                    我的团队
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <RankIcon rank={clan.rank} />
                <span className=" text-sm">排名 #{clan.rank}</span>
                <RankChange current={clan.rank} previous={clan.previousRank} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className=" text-xs">
              {clan.totalScore} IDO
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <MemberRing members={clan.members} />

        <div className="flex justify-between items-center text-sm">
          <div className="">
            <span className="text-primary font-bold">
              {clan.remainingMembers}
            </span>
            <span className="text-muted-foreground">/{clan.totalMembers}</span>
            <span className="ml-2 text-muted-foreground">剩余</span>
          </div>
          <div className="">
            <span className="text-accent font-bold">
              L={formatTokenAmount(clan.leverage, { symbol: "", decimals: 3 })}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground ">分数趋势</span>
          <Sparkline data={clan.scoreHistory} />
        </div>

        {/* Dividend Vault Widget */}
        <DividendVaultBlock wedoBalance={clan.dividendVault.totalBalance} />
      </CardContent>
    </Card>
  );
}

export function ClanCardSkeleton() {
  return (
    <Card className="">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Skeleton className="w-40 h-8 rounded-full" />
        </div>

        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-24" />
        </div>

        <Skeleton className="h-16 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}
