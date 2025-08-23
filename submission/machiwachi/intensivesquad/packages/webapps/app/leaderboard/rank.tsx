import {
  Crown,
  TrendingDown,
  TrendingUp,
  Shield,
  Star,
  Trophy,
} from "lucide-react";

export const RankIcon = ({ rank }: { rank: number }) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Trophy className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Star className="w-5 h-5 text-amber-600" />;
    default:
      return <Shield className="w-5 h-5 text-muted-foreground" />;
  }
};

export const RankChange = ({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) => {
  if (current < previous) {
    return <TrendingUp className="w-4 h-4 text-accent" />;
  } else if (current > previous) {
    return <TrendingDown className="w-4 h-4 text-destructive" />;
  }
  return null;
};
