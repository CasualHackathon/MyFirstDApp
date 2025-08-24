import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface CancelTaskProps {
  taskId: string;
  taskStatus: number;
  onSuccess?: () => void;
}

export const CancelTask = ({ taskId, taskStatus, onSuccess }: CancelTaskProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { writeContractAsync: cancelTask } = useScaffoldWriteContract({ contractName: "BiddingTask" });

  const handleCancelTask = async () => {
    try {
      await cancelTask({
        functionName: "terminateTask",
        args: [BigInt(taskId)],
      });
      setIsModalOpen(false);
      onSuccess?.();
    } catch (e) {
      console.error("Error cancelling task:", e);
    }
  };

  // 只有任务状态为Open (0) 或 InProgress (1) 时才显示取消按钮
  if (taskStatus !== 0 && taskStatus !== 1) {
    return null;
  }

  return (
    <>
      <button className="btn btn-error btn-sm" onClick={() => setIsModalOpen(true)}>
        取消任务
      </button>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">确认取消任务</h3>
            <p className="py-4">确定要取消这个任务吗？</p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                返回
              </button>
              <button className="btn btn-error" onClick={handleCancelTask}>
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
