"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api";
import { formatAddress } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { blo } from "blo";
import { BarChart3 } from "lucide-react";

export const UserRankingsChart = () => {
  const {
    data: sortedUsers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["leaderboard", "ido", "user"],
    queryFn: async () => {
      const res = await apiClient.leaderboard.ido.user.$get();
      return res.json();
    },
  });

  if (!sortedUsers) return null;

  const maxScore = Math.max(...sortedUsers.map((u) => u.score));

  return (
    <div className="space-y-3">
      <h3 className=" font-bold text-lg flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        用户排行榜（IDO）
      </h3>
      <div className="space-y-2">
        {sortedUsers.slice(0, 10).map((user, index) => {
          // const clan = clans.find((c) => c.id === user.clanId);
          const barWidth = (user.score / maxScore) * 100;

          return (
            <div
              key={user.address}
              className="flex items-center gap-3 p-4 bg-muted/20"
            >
              <div className="flex items-center gap-2 w-20">
                <span className=" text-sm font-bold">#{index + 1}</span>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={blo(user.address)} alt={user.address} />
                  <AvatarFallback className=" text-xs">
                    {user.address.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className=" text-sm font-medium">
                      {formatAddress(user.address)}
                    </span>
                    {/* <span className=" text-xs text-muted-foreground">
                      {clan?.flag} {clan?.name}
                    </span> */}
                  </div>
                  <span className=" text-sm font-bold">
                    {user.score.toFixed(2)} IDO
                  </span>
                </div>

                <div className="w-full bg-muted/30 h-3 rounded  overflow-hidden">
                  <div
                    className="h-full bg-primary/80 transition-all duration-500 "
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
