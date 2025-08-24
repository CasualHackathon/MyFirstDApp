"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AddWorker } from "./_components/AddWorker";
import { ApproveProof } from "./_components/ApproveProof";
import { CancelTask } from "./_components/CancelTask";
import { ClaimReward } from "./_components/ClaimReward";
import { DisputeButton } from "./_components/DisputeButton";
import { ExtendDeadline } from "./_components/ExtendDeadline";
import { IncreaseReward } from "./_components/IncreaseReward";
import { ProofOfWork } from "./_components/ProofOfWork";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const FixedPaymentTaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { address: connectedAddress } = useAccount();

  // 控制工作量证明模态框的显示状态
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  // 从链上获取任务详情
  const {
    data: task,
    isLoading: isTaskLoading,
    refetch: refetchTask,
  } = useScaffoldReadContract({
    contractName: "FixedPaymentTask",
    functionName: "tasks",
    args: [BigInt(taskId as string)],
  });

  // 从链上获取任务的工作者地址
  const { data: taskWorker } = useScaffoldReadContract({
    contractName: "FixedPaymentTask",
    functionName: "taskWorker",
    args: [BigInt(taskId as string)],
  });

  // 从链上获取任务的工作量证明
  const { data: taskProof } = useScaffoldReadContract({
    contractName: "FixedPaymentTask",
    functionName: "taskWorkProofs",
    args: [BigInt(taskId as string), taskWorker || ""],
  });

  const formatDeadline = (deadline: bigint) => {
    const date = new Date(Number(deadline) * 1000);
    return date.toLocaleString();
  };

  const formatCreatedAt = (createdAt: bigint) => {
    const date = new Date(Number(createdAt) * 1000);
    return date.toLocaleString();
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Open";
      case 1:
        return "InProgress";
      case 2:
        return "Completed";
      case 3:
        return "Paid";
      case 4:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: // Open
        return "badge-success";
      case 1: // InProgress
        return "badge-warning";
      case 2: // Completed
        return "badge-info";
      case 3: // Paid
        return "badge-primary";
      case 4: // Cancelled
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  if (isTaskLoading) {
    return (
      <div className="flex items-center justify-center pt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center pt-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">任务未找到</h2>
          <Link href="/fixed-payment" className="btn btn-primary">
            返回任务列表
          </Link>
        </div>
      </div>
    );
  }

  // 解构任务数据
  const [id, creator, title, description, totalreward, deadline, status, createdAt] = task || [];

  // 检查当前用户是否为任务创建者
  const isTaskCreator = connectedAddress && creator && connectedAddress.toLowerCase() === creator.toLowerCase();

  return (
    <div className="flex flex-col items-center pt-10 px-2 min-h-screen bg-gradient-to-br from-base-200 to-base-100">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center">
          <Link href="/fixed-payment" className="btn btn-sm btn-outline">
            ← 返回任务列表
          </Link>
          <div className="flex gap-2">
            {/* 只有任务创建者且任务不是已取消或已支付状态时才显示取消任务按钮 */}
            {isTaskCreator && status !== 4 && status !== 3 && (
              <CancelTask taskId={taskId as string} taskStatus={status} onSuccess={refetchTask} />
            )}
            {/* 只有工作者且任务状态为InProgress时才显示提交工作量证明按钮 */}
            {status === 1 &&
              taskWorker &&
              connectedAddress &&
              taskWorker.toLowerCase() === connectedAddress.toLowerCase() && (
                <button className="btn btn-primary" onClick={() => setIsProofModalOpen(true)}>
                  提交工作量证明
                </button>
              )}
            {/* 只有工作者且任务状态为Completed时才能申领报酬 */}
            {connectedAddress &&
              taskWorker &&
              connectedAddress.toLowerCase() === taskWorker.toLowerCase() &&
              status === 2 && <ClaimReward taskId={taskId as string} onSuccess={refetchTask} />}
          </div>
        </div>

        {/* 任务详情卡片 */}
        <div className="card bg-base-100 shadow-2xl border border-base-300 rounded-3xl">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <h1 className="card-title text-3xl font-bold mb-2 text-primary">{title}</h1>
                <span className={`badge ${getStatusColor(status)} badge-lg text-base mt-2`}>
                  {getStatusText(status)}
                </span>
                <div className="mt-4 bg-base-200 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">任务描述</p>
                  <p className="mt-1 text-base leading-relaxed">{description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 min-w-[180px] items-end">
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">任务ID</div>
                  <div className="font-mono text-lg">#{id.toString()}</div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">创建时间</div>
                  <div className="font-semibold">{formatCreatedAt(createdAt)}</div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">截止时间</div>
                  <div className="font-semibold">{formatDeadline(deadline)}</div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">任务报酬</div>
                  <div className="font-semibold">{formatUnits(totalreward, 18)} TST</div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">任务创建者</div>
                  <Address address={creator} />
                </div>
                {taskWorker && (
                  <div className="bg-base-200 rounded-xl p-3 w-full">
                    <div className="text-xs text-gray-500">工作者</div>
                    <Address address={taskWorker} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 操作区：添加工作者 */}
        {isTaskCreator && status === 0 && (
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px]">
              <AddWorker taskId={taskId as string} onSuccess={refetchTask} />
            </div>
          </div>
        )}

        {/* 工作量证明提交模态框 */}
        {status === 1 && taskWorker && (
          <ProofOfWork
            taskId={taskId as string}
            taskDeadline={deadline}
            isOpen={isProofModalOpen}
            onClose={() => setIsProofModalOpen(false)}
            onSuccess={refetchTask}
          />
        )}

        {/* 显示已提交的工作量证明 */}
        {taskProof && taskProof[0] && (
          <div className="card bg-base-100 shadow border border-base-300 rounded-2xl">
            <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="card-title text-xl font-bold mb-2">工作量证明</h2>
                <div className="form-control mt-2">
                  <label className="label">
                    <span className="label-text">提交时间</span>
                  </label>
                  <p className="font-mono">{new Date(Number(taskProof[3]) * 1000).toLocaleString()}</p>
                </div>
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">证明内容</span>
                  </label>
                  <div className="p-4 bg-base-200 rounded-lg text-base">
                    <p>{taskProof[0]}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 justify-center items-end">
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">状态</span>
                  </label>
                  <p className="font-semibold">{taskProof[2] ? "已批准" : "待批准"}</p>
                </div>
                {/* 只有任务创建者且工作量证明尚未批准时才显示批准按钮 */}
                {isTaskCreator && !taskProof[2] && status === 1 && taskWorker && (
                  <ApproveProof taskId={taskId as string} workerAddress={taskWorker} onSuccess={refetchTask} />
                )}
                {/* 只有工作者且工作量证明尚未批准时才显示提出纠纷按钮 */}
                {connectedAddress &&
                  taskWorker &&
                  connectedAddress.toLowerCase() === taskWorker.toLowerCase() &&
                  !taskProof[2] &&
                  status === 1 && <DisputeButton taskId={taskId as string} onSuccess={refetchTask} />}
              </div>
            </div>
          </div>
        )}

        {/* 操作区：延长截止日期和增加奖励同一行 */}
        {isTaskCreator && (status === 0 || status === 1 || status === 2) && (
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex-1 min-w-[220px]">
              <ExtendDeadline taskId={taskId as string} currentDeadline={deadline} onSuccess={refetchTask} />
            </div>
            <div className="flex-1 min-w-[220px]">
              <IncreaseReward taskId={taskId as string} onSuccess={refetchTask} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixedPaymentTaskDetailPage;
