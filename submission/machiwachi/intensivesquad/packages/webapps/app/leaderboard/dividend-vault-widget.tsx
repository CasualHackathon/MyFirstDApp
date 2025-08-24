import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent, CardHeader } from "@/components/retroui/Card";
import { apiClient } from "@/lib/api";
import { getBlockchainExplorerUrl } from "@/lib/utils";
import { IDO_TOKEN, WEDO_TOKEN } from "@/lib/constant";
import {
  useReadTeamManagerAccountTeam,
  useSimulateTeamEconomyClaim,
  useSimulateTeamEconomyWithdrawAll,
  useWriteTeamEconomyClaim,
  useWriteTeamEconomyWithdrawAll,
} from "@/lib/contracts";
import { useTeamEconomy } from "@/lib/hooks/useTeamEconomy";
import { type Team } from "@/lib/typings";
import { formatTokenAmount } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRightIcon,
  Coins,
  Download,
  ExternalLinkIcon,
  Gift,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import Link from "next/link";

export const DividendVaultWidget = ({ clan }: { clan: Team }) => {
  const { address: walletAddress, isConnected: isWalletConnected } =
    useAccount();
  const { refetch, data: economyData } = useTeamEconomy(clan.id);
  const { data: userTeamId } = useReadTeamManagerAccountTeam({
    args: [walletAddress ?? "0x0000000000000000000000000000000000000000"],
  });

  const queryClient = useQueryClient();

  console.log({ economyData });

  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isMember = Number(userTeamId) === clan.id;

  // Withdraw functionality
  const { data: simulateWithdrawAll } = useSimulateTeamEconomyWithdrawAll({
    args: [BigInt(clan.id)],
    query: {
      enabled: !!economyData?.teamWedoBalance && isMember,
    },
  });

  const {
    data: withdrawHash,
    writeContract: writeWithdrawAll,
    isPending: isWithdrawPending,
  } = useWriteTeamEconomyWithdrawAll();

  const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  // Claim functionality
  const { data: simulateClaim } = useSimulateTeamEconomyClaim({
    args: [BigInt(clan.id)],
    query: {
      enabled: !!economyData && economyData.userPendingIdo > 0 && isMember,
    },
  });

  const {
    data: claimHash,
    writeContract: writeClaim,
    isPending: isClaimPending,
  } = useWriteTeamEconomyClaim();

  const { isLoading: isClaimConfirming } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Reset withdrawing state when transaction is confirmed
  useEffect(() => {
    if (withdrawHash && !isWithdrawConfirming && !isWithdrawPending) {
      setIsWithdrawing(false);
    }
  }, [withdrawHash, isWithdrawConfirming, isWithdrawPending]);

  if (!economyData) return null;

  const handleClaimRewards = async (
    clanId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Prevent opening clan details
    if (!isWalletConnected || !isMember || !simulateClaim || !walletAddress)
      return;

    writeClaim(simulateClaim.request, {
      onSuccess: async (hash) => {
        toast.success("交易已提交，正在确认中...");

        try {
          // 调用API端点来跟踪交易并更新活动记录
          const response = await apiClient.claim.track.$post({
            json: {
              txHash: hash,
              teamId: clanId,
              account: walletAddress,
            },
          });

          if (response.ok) {
            const result = await response.json();
            toast.success(
              `奖励领取成功！获得 ${result.claimedAmount.toFixed(2)} IDO`
            );
            refetch();
          } else {
            console.error("API跟踪失败");
            toast.warning("奖励领取成功，但活动记录更新失败");
          }

          queryClient.invalidateQueries({
            queryKey: ["teams"],
          });
        } catch (error) {
          console.error("跟踪Claim交易时出错:", error);
          toast.warning("奖励领取成功，但活动记录更新失败");
        }
      },
      onError: (error) => {
        console.error("Claim交易失败:", error);
        toast.error("奖励领取失败");
      },
    });
  };

  const handleWithdraw = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening clan details
    if (
      !isWalletConnected ||
      !isMember ||
      !simulateWithdrawAll ||
      !walletAddress
    )
      return;

    setIsWithdrawing(true);
    writeWithdrawAll(simulateWithdrawAll.request, {
      onSuccess: async (hash) => {
        toast.success("转换交易已提交，正在确认中...");

        try {
          // 调用API端点来跟踪交易并更新活动记录
          const response = await apiClient.withdraw.track.$post({
            json: {
              txHash: hash,
              teamId: clan.id,
              account: walletAddress,
            },
          });

          if (response.ok) {
            const result = await response.json();
            toast.success(
              `WEDO转换成功！${result.withdrawnWedoAmount.toFixed(
                2
              )} WEDO → ${result.mintedIdoAmount.toFixed(
                2
              )} IDO (杠杆: ${result.leverageRatio.toFixed(2)}x)`
            );
          } else {
            console.error("Withdraw API跟踪失败");
            toast.warning("WEDO转换成功，但活动记录更新失败");
          }
          refetch();
          queryClient.invalidateQueries({
            queryKey: ["teams"],
          });
        } catch (error) {
          console.error("跟踪Withdraw交易时出错:", error);
          toast.warning("WEDO转换成功，但活动记录更新失败");
        }
      },
      onError: (error) => {
        console.error("Withdraw交易失败:", error);
        toast.error("WEDO转换失败");
        setIsWithdrawing(false);
      },
    });
  };

  const canClaimRewards = (clanId: number) => {
    return (
      isWalletConnected &&
      isMember &&
      economyData.userPendingIdo > 0 &&
      !!simulateClaim
    );
  };

  const hasClaimableRewards = canClaimRewards(clan.id);

  return (
    <Card className="w-full hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          <h4 className=" font-bold">分红金库</h4>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className=" text-xs text-muted-foreground">金库总额</p>
            <p className=" text-lg font-bold text-primary ">
              {formatTokenAmount(economyData.teamWedoBalance, WEDO_TOKEN)}
            </p>
            <div>
              <p className=" text-xs text-muted-foreground">兑换率</p>
              <p className=" text-lg font-bold text-amber-400 ">
                {formatTokenAmount(economyData.teamLeverage, {
                  symbol: "IDO/WEDO",
                  decimals: 3,
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 justify-center items-center">
            {/* Withdraw Button */}
            {isMember && (
              <Button
                onClick={handleWithdraw}
                disabled={
                  isWithdrawPending ||
                  isWithdrawConfirming ||
                  !simulateWithdrawAll
                }
                className="  mb-2"
              >
                {isWithdrawPending || isWithdrawConfirming ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRightIcon className="w-4 h-4" />
                )}
                {isWithdrawPending || isWithdrawConfirming
                  ? "转换中..."
                  : "转换 WEDO 为 IDO"}
              </Button>
            )}

            {isMember && economyData.teamWedoBalance <= 0 && (
              <div className="text-sm mb-2 text-shadow-accent flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                金库余额不足
              </div>
            )}

            {/* Withdraw success indicator */}
            {withdrawHash && !isWithdrawPending && !isWithdrawConfirming && (
              <Link
                className=" text-sm mb-2 text-accent flex items-center gap-2"
                href={getBlockchainExplorerUrl(withdrawHash)}
                target="_blank"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                WEDO转换成功！
              </Link>
            )}

            {/* Claim success indicator */}
            {claimHash && !isClaimPending && !isClaimConfirming && (
              <Link
                className=" text-sm mb-2 text-accent flex items-center gap-2"
                href={getBlockchainExplorerUrl(claimHash)}
                target="_blank"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                WEDO转换成功！
              </Link>
            )}
          </div>

          <div>
            <p className=" text-xs text-muted-foreground">你的份额</p>
            <div className=" text-lg font-bold text-accent  flex items-center gap-2">
              {isMember
                ? formatTokenAmount(economyData.userPendingIdo, IDO_TOKEN)
                : "你不是团队成员"}
              {(hasClaimableRewards || isClaimPending || isClaimConfirming) && (
                <Button
                  onClick={(e) => handleClaimRewards(clan.id, e)}
                  disabled={
                    isClaimPending || isClaimConfirming || !simulateClaim
                  }
                  className=""
                  size="sm"
                >
                  {isClaimPending || isClaimConfirming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Gift className="w-4 h-4" />
                  )}
                  {isClaimPending || isClaimConfirming ? "领取中" : "领取"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h5 className=" text-sm font-bold text-muted-foreground">成员贡献</h5>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {clan.members.map((member, index) => {
              const contribution = Math.random() * 50 + 10; // Mock contribution amount
              const isCurrentUser =
                member.address === walletAddress && isMember;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded  text-xs ${
                    isCurrentUser
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/10"
                  } ${
                    member.status === "eliminated" ? "opacity-50 grayscale" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
                    <span
                      className={` ${
                        isCurrentUser ? "font-bold text-primary" : ""
                      }`}
                    >
                      {member.address}
                    </span>
                    {member.status === "eliminated" && (
                      <Badge variant="outline" className=" text-xs">
                        已淘汰
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className=" font-bold">
                      {formatTokenAmount(contribution, WEDO_TOKEN)}
                    </p>
                    <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                        style={{ width: `${(contribution / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-xs  text-muted-foreground">
          <p>
            已累计分发：{" "}
            {formatTokenAmount(clan.dividendVault.totalDistributed, IDO_TOKEN)}
          </p>
        </div>

        {!isMember && (
          <div className="text-center text-xs  text-muted-foreground">
            加入部落以获取分红奖励
          </div>
        )}
      </CardContent>
    </Card>
  );
};
