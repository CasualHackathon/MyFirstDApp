import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ClaimRewardProps {
  taskId: string;
  onSuccess?: () => void;
}

export const ClaimReward = ({ taskId, onSuccess }: ClaimRewardProps) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const { writeContractAsync: payTask } = useScaffoldWriteContract({ contractName: "BiddingTask" });

  const handleClaimReward = async () => {
    try {
      setIsClaiming(true);

      await payTask({
        functionName: "payTask",
        args: [BigInt(taskId)],
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      console.error("Error claiming reward:", e);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <button
      className={`btn btn-primary ${isClaiming ? "loading" : ""}`}
      onClick={handleClaimReward}
      disabled={isClaiming}
    >
      {isClaiming ? "申领中..." : "申领报酬"}
    </button>
  );
};
