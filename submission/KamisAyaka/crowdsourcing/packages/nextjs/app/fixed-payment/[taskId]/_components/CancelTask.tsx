import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface CancelTaskProps {
  taskId: string;
  taskStatus: number;
  onSuccess?: () => void;
}

export const CancelTask = ({ taskId, taskStatus, onSuccess }: CancelTaskProps) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const { writeContractAsync: terminateTask } = useScaffoldWriteContract({ contractName: "FixedPaymentTask" });

  const handleCancelTask = async () => {
    try {
      setIsCancelling(true);

      await terminateTask({
        functionName: "terminateTask",
        args: [BigInt(taskId)],
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      console.error("Error cancelling task:", e);
    } finally {
      setIsCancelling(false);
    }
  };

  // 根据合约逻辑更新，只要不是已经支付(3)或者已经取消(4)的任务都可以使用取消任务的功能
  const canCancelTask = taskStatus !== 3 && taskStatus !== 4;

  if (!canCancelTask) {
    return null;
  }

  return (
    <button
      className={`btn btn-error ${isCancelling ? "loading" : ""}`}
      onClick={handleCancelTask}
      disabled={isCancelling}
    >
      {isCancelling ? "取消中..." : "取消任务"}
    </button>
  );
};
