import { WEDO_TOKEN } from "@/lib/constant";
import { formatTokenAmount } from "@/lib/utils";
import { Coins } from "lucide-react";
export const DividendVaultBlock = ({
  wedoBalance,
}: {
  wedoBalance: bigint;
}) => {
  return (
    <div className="flex items-center justify-between p-2 bg-muted/20 rounded ">
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-yellow-500" />
        <span className=" text-xs text-muted-foreground">奖励金库：</span>
        <span className=" text-xs font-bold">
          {formatTokenAmount(wedoBalance, WEDO_TOKEN)}
        </span>
      </div>
    </div>
  );
};
