import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ApproveProofProps {
  taskId: string;
  workerAddress: string;
  onSuccess?: () => void;
}

export const ApproveProof = ({ taskId, workerAddress, onSuccess }: ApproveProofProps) => {
  const [isApproving, setIsApproving] = useState(false);
  const { writeContractAsync: approveProofOfWork } = useScaffoldWriteContract({ contractName: "FixedPaymentTask" });

  const handleApproveProof = async () => {
    try {
      setIsApproving(true);

      await approveProofOfWork({
        functionName: "approveProofOfWork",
        args: [BigInt(taskId), workerAddress],
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      console.error("Error approving proof of work:", e);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <button
      className={`btn btn-success ${isApproving ? "loading" : ""}`}
      onClick={handleApproveProof}
      disabled={isApproving}
    >
      {isApproving ? "批准中..." : "批准工作量证明"}
    </button>
  );
};
