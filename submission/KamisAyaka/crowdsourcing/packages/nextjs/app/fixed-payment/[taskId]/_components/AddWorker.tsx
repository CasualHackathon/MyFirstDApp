import { useState } from "react";
import { parseEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface AddWorkerProps {
  taskId: string;
  onSuccess?: () => void;
}

export const AddWorker = ({ taskId, onSuccess }: AddWorkerProps) => {
  const [workerAddress, setWorkerAddress] = useState("");
  const [taskReward, setTaskReward] = useState("");
  const [isAddingWorker, setIsAddingWorker] = useState(false);

  // 获取FixedPaymentTask合约信息
  const { data: fixedPaymentTaskContract } = useDeployedContractInfo({ contractName: "FixedPaymentTask" });

  // 获取TaskToken合约地址
  const { data: taskTokenData } = useScaffoldReadContract({
    contractName: "FixedPaymentTask",
    functionName: "taskToken",
  });

  const { writeContractAsync: addWorker } = useScaffoldWriteContract({ contractName: "FixedPaymentTask" });
  const { writeContractAsync: approveToken } = useScaffoldWriteContract({ contractName: "TaskToken" });

  const handleAddWorker = async () => {
    if (!workerAddress || !taskReward || Number(taskReward) <= 0) {
      notification.error("请填写工作者地址和报酬");
      return;
    }

    if (!fixedPaymentTaskContract || !taskTokenData) {
      notification.error("合约未部署或地址无效");
      return;
    }

    try {
      setIsAddingWorker(true);

      // 将用户输入的值转换为wei单位
      const rewardInWei = parseEther(taskReward);

      // 先授权代币
      await approveToken({
        functionName: "approve",
        args: [fixedPaymentTaskContract.address, rewardInWei],
      });

      // 然后添加工作者
      await addWorker({
        functionName: "addWorker",
        args: [BigInt(taskId), workerAddress, rewardInWei],
      });

      // 清空输入框
      setWorkerAddress("");
      setTaskReward("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      console.error("Error adding worker:", e);
      notification.error("添加工作者失败");
    } finally {
      setIsAddingWorker(false);
    }
  };

  return (
    <div className="w-full bg-base-100 border border-base-300 rounded-2xl shadow-lg p-4">
      <div className="card-body p-0">
        <h2 className="card-title">添加工作者</h2>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">工作者地址</span>
          </label>
          <input
            type="text"
            placeholder="工作者钱包地址"
            className="input input-bordered w-full"
            value={workerAddress}
            onChange={e => setWorkerAddress(e.target.value)}
          />
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">任务报酬 (TST)</span>
          </label>
          <input
            type="number"
            placeholder="任务报酬"
            className="input input-bordered w-full"
            value={taskReward}
            onChange={e => setTaskReward(e.target.value)}
          />
        </div>
        <button
          className={`btn btn-primary ${isAddingWorker ? "loading" : ""}`}
          onClick={handleAddWorker}
          disabled={isAddingWorker}
        >
          {isAddingWorker ? "添加中..." : "添加工作者并设置报酬"}
        </button>
      </div>
    </div>
  );
};
