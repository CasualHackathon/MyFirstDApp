import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ApproveProofOfWorkProps {
  taskId: bigint;
  taskWorker: string;
  isTaskCreator: boolean;
  isTaskInProgress: boolean;
}

export const ApproveProofOfWork = ({
  taskId,
  taskWorker,
  isTaskCreator,
  isTaskInProgress,
}: ApproveProofOfWorkProps) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const { writeContractAsync: approveProofOfWork } = useScaffoldWriteContract({ contractName: "BiddingTask" });

  const handleApproveProof = async () => {
    try {
      setIsApproving(true);

      await approveProofOfWork({
        functionName: "approveProofOfWork",
        args: [taskId, taskWorker],
      });
    } catch (e) {
      console.error("Error approving proof of work:", e);
    } finally {
      setIsApproving(false);
    }
  };

  const handlePayTask = async () => {
    try {
      setIsPaying(true);

      await approveProofOfWork({
        functionName: "payTask",
        args: [taskId],
      });
    } catch (e) {
      console.error("Error paying task:", e);
    } finally {
      setIsPaying(false);
    }
  };

  if (!isTaskCreator) {
    return null;
  }

  if (!isTaskInProgress) {
    return (
      <div className="bg-base-200 p-4 rounded-xl">
        <p className="text-gray-500">任务不在进行中状态，无法验证工作量证明</p>
      </div>
    );
  }

  return (
    <div className="bg-base-200 p-4 rounded-xl">
      <div className="space-y-4">
        {!isApproving ? (
          <button
            className={`btn btn-success w-full ${isApproving ? "loading" : ""}`}
            onClick={handleApproveProof}
            disabled={isApproving || isPaying}
          >
            {isApproving ? "批准中..." : "批准工作量证明"}
          </button>
        ) : (
          <button
            className={`btn btn-secondary w-full ${isPaying ? "loading" : ""}`}
            onClick={handlePayTask}
            disabled={isApproving || isPaying}
          >
            {isPaying ? "支付中..." : "支付任务奖励"}
          </button>
        )}
      </div>
    </div>
  );
};
