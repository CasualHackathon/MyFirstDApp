import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/retroui/Badge";
import { RankIcon } from "./rank";
import { useTeams } from "@/lib/hooks/useTeams";

export const ClanRankingsChart = () => {
  const { teams, isLoading } = useTeams();

  if (isLoading || !teams) return null;

  const sortedClans = [...teams].sort((a, b) => b.totalScore - a.totalScore);
  const maxScore = Math.max(...sortedClans.map((c) => c.totalScore));

  return (
    <div className="space-y-3">
      <h3 className=" font-bold text-lg flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        部落总分排行榜（IDO）
      </h3>
      <div className="space-y-2">
        {sortedClans.map((clan, index) => {
          const barWidth = (clan.totalScore / maxScore) * 100;

          return (
            <div
              key={clan.id}
              className="flex items-center gap-3 p-4 bg-muted/20"
            >
              <div className="flex items-center gap-2 w-16">
                <RankIcon rank={clan.rank} />
                <span className=" text-sm font-bold">#{clan.rank}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{clan.flag}</span>
                    <span className=" text-sm font-medium">{clan.name}</span>
                    <Badge size="sm" className="text-xs">
                      {clan.remainingMembers}/{clan.totalMembers} active
                    </Badge>
                  </div>
                  <span className=" text-sm font-bold">
                    {clan.totalScore.toFixed(0)} IDO
                  </span>
                </div>

                <div className="w-full bg-muted/30 h-4 rounded  overflow-hidden">
                  <div
                    className="h-full bg-accent/80 transition-all duration-500 "
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
