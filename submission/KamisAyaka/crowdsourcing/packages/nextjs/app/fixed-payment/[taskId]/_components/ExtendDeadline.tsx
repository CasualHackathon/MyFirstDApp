"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const ExtendDeadline = ({
  taskId,
  currentDeadline,
  onSuccess,
}: {
  taskId: string;
  currentDeadline: bigint;
  onSuccess?: () => void;
}) => {
  const { address: connectedAddress } = useAccount();
  const [newDeadline, setNewDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: task } = useScaffoldReadContract({
    contractName: "FixedPaymentTask",
    functionName: "tasks",
    args: [BigInt(taskId)],
  });

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "FixedPaymentTask" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDeadline) {
      setError("请选择新的截止日期");
      return;
    }

    const newDeadlineTimestamp = new Date(newDeadline).getTime() / 1000;

    if (newDeadlineTimestamp <= Number(currentDeadline)) {
      setError("新的截止日期必须晚于当前截止日期");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await writeContractAsync({
        functionName: "changedeadline",
        args: [BigInt(taskId), BigInt(Math.floor(newDeadlineTimestamp))],
      });

      onSuccess?.();
      setNewDeadline("");
    } catch (e: any) {
      console.error("Error extending deadline:", e);
      setError(e.message || "延长截止日期时出错");
    } finally {
      setIsLoading(false);
    }
  };

  // 只有任务创建者才能延长截止日期
  const isTaskCreator = task && connectedAddress && task[1].toLowerCase() === connectedAddress.toLowerCase();

  if (!isTaskCreator) {
    return null;
  }

  return (
    <div className="card bg-base-100 shadow-xl mt-6">
      <div className="card-body">
        <h2 className="card-title">延长截止日期</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">新的截止日期</span>
            </label>
            <input
              type="datetime-local"
              value={newDeadline}
              onChange={e => setNewDeadline(e.target.value)}
              className="input input-bordered"
              min={new Date(Number(currentDeadline) * 1000).toISOString().slice(0, 16)}
              required
            />
          </div>

          {error && <div className="text-error text-sm mt-2">{error}</div>}

          <div className="card-actions justify-end mt-4">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  延长中...
                </>
              ) : (
                "延长截止日期"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
