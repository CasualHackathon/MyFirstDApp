"use client";

import { Card, CardContent } from "@/components/retroui/Card";
import { useTeams } from "@/lib/hooks/useTeams";
import { type Team } from "@/lib/typings";
import { Skull, Trophy, Users, Zap } from "lucide-react";
import { useState } from "react";
import { ClanCard, ClanCardSkeleton } from "../clan-card";
import { ClanDetailDialog } from "../clan-detail.dialog";
import { useReadIdoTokenTotalSupply } from "@/lib/contracts";
import { formatEther } from "viem";

import { CreateButton } from "@/components/create.button";

export default function ClansLeaderboard() {
  const { teams, isLoading } = useTeams();
  const {
    data: idoTokenTotalSupply,
    isLoading: isLoadingIDO,
    isError: isErrorIDO,
  } = useReadIdoTokenTotalSupply();

  const [selectedClan, setSelectedClan] = useState<Team | null>(null);

  if (!teams) return null;

  const totalClans = teams.length;

  return (
    <div className="">
      {/* Header */}
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="shadow-none hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold ">{totalClans}</p>
              <p className="text-sm text-muted-foreground ">部落总数</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent" />
            <div>
              <p className="text-2xl font-bold ">
                {isLoadingIDO
                  ? "Loading..."
                  : isErrorIDO || !idoTokenTotalSupply
                  ? "--"
                  : formatEther(idoTokenTotalSupply)}
              </p>
              <p className="text-sm text-muted-foreground ">总计流通量 IDO</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold ">
                    {teams.reduce(
                      (sum, team) => sum + team.remainingMembers,
                      0
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground ">现役战士</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Skull className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold  text-red-500">
                    {teams.reduce(
                      (sum, team) =>
                        sum + (team.totalMembers - team.remainingMembers),
                      0
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground ">已淘汰</p>
                </div>
              </div>
            </div>

            {/* Mini retention chart */}
            <div className="mt-4 pt-3 border-t border-muted">
              <p className="text-xs text-muted-foreground  mb-2">
                每日留存（近7天）
              </p>
              <div className="flex items-end gap-1 h-8">
                {[95, 89, 84, 78, 71, 65, 58].map((percentage, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-sm "
                      style={{ height: `${(percentage / 100) * 100}%` }}
                    />
                    <span className="text-xs  text-muted-foreground mt-1">
                      {percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Clans Grid */}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">所有部落</h1>

          <CreateButton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <ClanCardSkeleton key={index} />
              ))
            : teams.map((team) => (
                <ClanCard
                  key={team.id}
                  clan={team}
                  onClick={() => setSelectedClan(team)}
                />
              ))}
        </div>
        {/* Clan Detail Dialog */}
        <ClanDetailDialog
          open={!!selectedClan}
          onOpenChange={() => setSelectedClan(null)}
          clan={selectedClan}
        />
      </div>
    </div>
  );
}
