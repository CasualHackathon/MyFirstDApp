"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const DisputeButton = ({ taskId, onSuccess }: { taskId: string; onSuccess?: () => void }) => {
  const { address: connectedAddress } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { data: taskProof } = useScaffoldReadContract({
    contractName: "FixedPaymentTask",
    functionName: "taskWorkProofs",
    args: [BigInt(taskId), connectedAddress],
  });

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "FixedPaymentTask" });

  const handleFileDispute = async () => {
    try {
      setIsLoading(true);
      await writeContractAsync({
        functionName: "fileDisputeByWorker",
        args: [BigInt(taskId)],
      });
      onSuccess?.();
    } catch (e) {
      console.error("Error filing dispute:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 只有当用户是工作者且工作量证明已提交但未批准时才显示按钮
  if (!taskProof || !taskProof[0] || taskProof[2]) {
    return null;
  }

  return (
    <button className="btn btn-error" onClick={handleFileDispute} disabled={isLoading}>
      {isLoading ? (
        <>
          <span className="loading loading-spinner loading-xs"></span>
          提交中...
        </>
      ) : (
        "提出纠纷"
      )}
    </button>
  );
};
