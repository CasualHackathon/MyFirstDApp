"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/retroui/Dialog";
import { apiClient } from "@/lib/api";
import { IDO_TOKEN, WEDO_TOKEN } from "@/lib/constant";
import {
  useWriteTeamManagerJoin,
  useWriteTeamManagerLeave,
} from "@/lib/contracts";
import { useReadTeamManagerAccountTeam } from "@/lib/contracts/generated";
import type { Activity, Team } from "@/lib/typings";
import { cn, formatAddress, formatTokenAmount } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { blo } from "blo";
import { UserMinus, UserPlus } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { DividendVaultWidget } from "./dividend-vault-widget";

export function ClanDetailDialog({
  open,
  onOpenChange,
  clan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clan: Team | null;
}) {
  const { address, isConnected: isWalletConnected } = useAccount();
  const { isPending: isLeavePending, writeContractAsync: leaveClanAsync } =
    useWriteTeamManagerLeave();
  const { isPending: isJoinPending, writeContractAsync: joinClanAsync } =
    useWriteTeamManagerJoin();
  const queryClient = useQueryClient();

  const { data: userTeamId, refetch: refetchUserTeamId } =
    useReadTeamManagerAccountTeam({
      args: [address ?? "0x0000000000000000000000000000000000000000"],
    });

  // 获取团队活动数据
  const { data: activities = [], isLoading: isActivitiesLoading } = useQuery({
    queryKey: ["activities", "team", clan?.id],
    queryFn: async () => {
      if (!clan?.id) return [];
      const res = await apiClient.teams[":teamId"].activities.$get({
        param: { teamId: clan.id.toString() },
      });
      const data = await res.json();
      return data;
    },
    enabled: !!clan?.id,
  });

  async function handleJoinClan(id: number, e: React.MouseEvent) {
    e.stopPropagation();

    console.log("尝试加入部落，部落ID:", id);

    try {
      const tx = await joinClanAsync({
        args: [BigInt(id)],
      });
      console.log("加入部落交易已发送，交易哈希:", tx);

      const verifyRes = await apiClient.members.events.$post({
        json: {
          txHash: tx,
        },
      });

      console.log("后端校验结果:", verifyRes);

      if (!verifyRes.ok) {
        console.error("加入部落失败，后端返回非OK:", verifyRes);
        throw new Error("加入部落失败");
      }

      toast.success("加入部落成功");
      console.log("加入部落成功");

      queryClient.invalidateQueries({ queryKey: ["teams"] });
      refetchUserTeamId();
    } catch (err) {
      console.error("加入部落失败:", err);
      toast.error("加入部落失败");
    }
  }

  async function handleLeaveClan(id: number, e: React.MouseEvent) {
    e.stopPropagation();

    console.log("尝试离开部落，部落ID:", id);

    try {
      const tx = await leaveClanAsync({
        args: [BigInt(0)],
      });
      console.log("离开部落交易已发送，交易哈希:", tx);

      const verifyRes = await apiClient.members.events.$post({
        json: {
          txHash: tx,
        },
      });

      console.log("后端校验结果:", verifyRes);

      if (!verifyRes.ok) {
        console.error("离开部落失败，后端返回非OK:", verifyRes);
        throw new Error("离开部落失败");
      }

      toast.success("离开部落成功");
      console.log("离开部落成功");

      queryClient.invalidateQueries({ queryKey: ["teams"] });
      refetchUserTeamId();
    } catch (err) {
      console.error("离开部落失败:", err);
      toast.error("离开部落失败");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-3xl ">
        {clan && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 text-2xl">
                <span className="text-3xl">{clan.flag}</span>
                {clan.name}
                <Badge variant="solid" className="">
                  排名 #{clan.rank}
                </Badge>
                {clan.isUserTeam && <Badge variant="surface">我的部落</Badge>}
              </div>
            </DialogHeader>

            <div className="space-y-6 p-4">
              {/* Dividend Vault Widget */}
              <DividendVaultWidget clan={clan} />

              {/* Members */}
              <div>
                <div className="flex justify-between items-center">
                  <h4 className=" font-bold mb-3">
                    部落成员(总计 {clan.totalScore} IDO)
                  </h4>
                  {!userTeamId && (
                    <Button
                      size="sm"
                      onClick={(e) => handleJoinClan(clan.id, e)}
                      className=""
                      disabled={isJoinPending}
                    >
                      <UserPlus className="w-4 h-4" />
                      {isJoinPending ? "加入中..." : `加入 ${clan.name}`}
                    </Button>
                  )}

                  {Number(userTeamId ?? 0) === clan.id && (
                    <Button
                      size="sm"
                      onClick={(e) => handleLeaveClan(clan.id, e)}
                      className="bg-destructive text-white hover:bg-destructive/9"
                      disabled={isLeavePending}
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      {isLeavePending ? "离开中..." : `离开 ${clan.name}`}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {clan.members.map((member) => (
                    <div
                      key={member.address}
                      className={`flex items-center gap-3 p-2 rounded  ${
                        member.status === "eliminated"
                          ? "eliminated bg-muted/50"
                          : "bg-card"
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={blo(member.address)}
                          alt={member.address}
                        />
                        <AvatarFallback className=" text-xs">
                          {member.address.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className=" text-sm">
                        {formatAddress(member.address)}
                      </span>
                      <Badge
                        variant={
                          member.status === "active" ? "solid" : "surface"
                        }
                        className=" text-xs ml-auto"
                      >
                        {member.status === "active" ? "活跃" : "已淘汰"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div>
                <h4 className=" font-bold mb-3">最近活动</h4>
                {isActivitiesLoading ? (
                  <div className="p-4 text-center text-muted-foreground ">
                    加载中...
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground ">
                    暂无活动记录
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {activities.map((activity: Activity) => {
                      const dividendContribution = activity.wedoAmount;
                      return (
                        <div
                          key={activity.id}
                          className="flex justify-between items-center p-3 bg-muted/30 rounded  cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            if (activity.txHash) {
                              window.open(
                                `https://sepolia.etherscan.io/tx/${activity.txHash}`,
                                "_blank"
                              );
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={blo(activity.user)} />
                              <AvatarFallback>
                                {activity.user.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <p className=" text-sm font-medium">
                                {formatAddress(activity.user)}
                              </p>
                              <p className=" text-xs text-muted-foreground">
                                {activity.action}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            {
                              <>
                                <p className=" text-sm font-semibold text-green-800">
                                  {activity.idoAmount > 0 ? "+" : ""}
                                  {formatTokenAmount(
                                    activity.idoAmount,
                                    IDO_TOKEN
                                  )}
                                </p>
                                <p
                                  className={cn(
                                    " text-xs text-muted-foreground",
                                    activity.wedoAmount > 0 && "text-green-800",
                                    activity.wedoAmount < 0 && "text-red-800"
                                  )}
                                >
                                  金库：{activity.wedoAmount > 0 ? "+" : ""}
                                  {formatTokenAmount(
                                    activity.wedoAmount,
                                    WEDO_TOKEN
                                  )}
                                </p>
                              </>
                            }
                            <p className=" text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString(
                                "zh-CN"
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
