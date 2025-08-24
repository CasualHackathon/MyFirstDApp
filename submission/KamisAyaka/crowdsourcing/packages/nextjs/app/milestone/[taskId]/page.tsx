"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AddMilestoneModal } from "./_components/AddMilestoneModal";
import { AddWorkerModal } from "./_components/AddWorkerModal";
import { CancelTask } from "./_components/CancelTask";
import { ExtendDeadline } from "./_components/ExtendDeadline";
import { IncreaseReward } from "./_components/IncreaseReward";
import { MilestonesList } from "./_components/MilestonesList";
import { SubmitProofModal } from "./_components/SubmitProofModal";
import { TaskInfoCard } from "./_components/TaskInfoCard";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const MilestoneTaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { address: connectedAddress } = useAccount();

  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number | null>(null);

  // 获取MilestonePaymentTask合约信息
  const { data: milestonePaymentTaskContract } = useDeployedContractInfo({ contractName: "MilestonePaymentTask" });

  // 获取TaskToken合约地址
  const { data: taskTokenData } = useScaffoldReadContract({
    contractName: "MilestonePaymentTask",
    functionName: "taskToken",
  });

  // 获取任务详情
  const {
    data: task,
    isLoading: isTaskLoading,
    refetch: refetchTask,
  } = useScaffoldReadContract({
    contractName: "MilestonePaymentTask",
    functionName: "tasks",
    args: [BigInt(taskId)],
  });

  // 获取任务工作者
  const { data: taskWorker } = useScaffoldReadContract({
    contractName: "MilestonePaymentTask",
    functionName: "taskWorker",
    args: [BigInt(taskId)],
  });

  // 获取所有里程碑数据
  const { data: milestones } = useScaffoldReadContract({
    contractName: "MilestonePaymentTask",
    functionName: "getAllMilestones",
    args: [BigInt(taskId)],
  });

  // 合约写入hooks
  const { writeContractAsync: approveMilestone } = useScaffoldWriteContract({
    contractName: "MilestonePaymentTask",
  });

  const { writeContractAsync: payMilestone } = useScaffoldWriteContract({
    contractName: "MilestonePaymentTask",
  });

  const { writeContractAsync: completeTask } = useScaffoldWriteContract({
    contractName: "MilestonePaymentTask",
  });

  const { writeContractAsync: addWorker } = useScaffoldWriteContract({ contractName: "MilestonePaymentTask" });
  const { writeContractAsync: approveToken } = useScaffoldWriteContract({ contractName: "TaskToken" });
  const { writeContractAsync: addMilestoneContract } = useScaffoldWriteContract({
    contractName: "MilestonePaymentTask",
  });

  const { writeContractAsync: submitMilestoneProofOfWork } = useScaffoldWriteContract({
    contractName: "MilestonePaymentTask",
  });

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
          <Link href="/milestone" className="btn btn-primary">
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
  const isTaskWorker = connectedAddress && taskWorker && connectedAddress.toLowerCase() === taskWorker.toLowerCase();

  // 检查任务状态
  const isTaskInProgress = BigInt(status || 0n) === 1n;

  // 将只读数组转换为可变数组
  const mutableMilestones = milestones ? [...milestones] : [];

  // 处理各种操作
  const handleAddWorkerClick = () => {
    setIsAddWorkerModalOpen(true);
  };

  const handleAddMilestoneClick = () => {
    setIsAddMilestoneModalOpen(true);
  };

  const handleApproveMilestone = async (index: number) => {
    try {
      const result = await approveMilestone({
        functionName: "approveMilestone",
        args: [BigInt(taskId), BigInt(index)],
      });
      console.log("Approval transaction result:", result);
      refetchTask();
    } catch (e) {
      console.error("Error approving milestone:", e);
    }
  };

  const handlePayMilestone = async (index: number) => {
    try {
      const result = await payMilestone({
        functionName: "payMilestone",
        args: [BigInt(taskId), BigInt(index)],
      });
      console.log("Payment transaction result:", result);
      refetchTask();
    } catch (e) {
      console.error("Error claiming milestone reward:", e);
    }
  };

  const handleSubmitProof = (index: number) => {
    setSelectedMilestoneIndex(index);
    setIsProofModalOpen(true);
  };

  const handleCompleteTask = async () => {
    try {
      const result = await completeTask({
        functionName: "completeTask",
        args: [BigInt(taskId)],
      });
      console.log("Complete task transaction result:", result);
      refetchTask();
    } catch (e) {
      console.error("Error completing task:", e);
    }
  };

  // 处理添加工作者
  const handleAddWorker = async (workerAddress: string, reward: string) => {
    try {
      if (!milestonePaymentTaskContract || !taskTokenData) {
        alert("合约未部署或地址无效");
        return;
      }

      // 批准代币
      const approveResult = await approveToken({
        functionName: "approve",
        args: [milestonePaymentTaskContract.address, parseEther(reward)],
      });

      // 等待授权交易确认
      console.log("Approval transaction result:", approveResult);

      // 添加工作者
      const addWorkerResult = await addWorker({
        functionName: "addWorker",
        args: [BigInt(taskId), workerAddress, parseEther(reward)],
      });

      console.log("Add worker transaction result:", addWorkerResult);

      refetchTask();
      setIsAddWorkerModalOpen(false);
    } catch (e) {
      console.error("Error adding worker:", e);
    }
  };

  // 处理添加里程碑
  const handleAddMilestone = async (description: string, reward: string) => {
    try {
      await addMilestoneContract({
        functionName: "addMilestone",
        args: [BigInt(taskId), description, parseEther(reward)],
      });

      refetchTask();
      setIsAddMilestoneModalOpen(false);
    } catch (e) {
      console.error("Error adding milestone:", e);
    }
  };

  // 处理提交工作量证明
  const handleSubmitMilestoneProof = async (proof: string) => {
    try {
      if (selectedMilestoneIndex === null) {
        alert("请选择一个里程碑");
        return;
      }

      await submitMilestoneProofOfWork({
        functionName: "submitMilestoneProofOfWork",
        args: [BigInt(taskId), BigInt(selectedMilestoneIndex), proof],
      });

      refetchTask();
      setIsProofModalOpen(false);
      setSelectedMilestoneIndex(null);
    } catch (e) {
      console.error("Error submitting proof:", e);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 px-2 min-h-screen bg-gradient-to-br from-base-200 to-base-100">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center">
          <Link href="/milestone" className="btn btn-sm btn-outline">
            ← 返回任务列表
          </Link>
          <div className="flex gap-2">
            {/* 只有任务创建者操作按钮 */}
            {isTaskCreator && (
              <>
                {/* 只有任务创建者且任务不是已取消或已支付状态时才显示取消任务按钮 */}
                {Number(status) !== 4 && Number(status) !== 3 && (
                  <CancelTask taskId={taskId} isTaskCreator={!!isTaskCreator} isTaskInProgress={isTaskInProgress} />
                )}
                {/* 只有任务创建者且所有里程碑都已完成时才能完成任务 */}
                {isTaskInProgress && mutableMilestones.length > 0 && (
                  <button className="btn btn-primary btn-sm" onClick={handleCompleteTask}>
                    完成任务
                  </button>
                )}
                {/* 添加工作者按钮 - 仅当任务状态为Open且未分配工作者时显示 */}
                {Number(status) === 0 && (
                  <button className="btn btn-primary btn-sm" onClick={handleAddWorkerClick}>
                    添加工作者
                  </button>
                )}
                {/* 添加里程碑按钮 - 仅当任务状态为InProgress时显示 */}
                {(Number(status) == 1 || Number(status) == 0) && (
                  <button className="btn btn-primary btn-sm" onClick={handleAddMilestoneClick}>
                    添加里程碑
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* 任务详情卡片 */}
        <TaskInfoCard
          task={{
            id: id || 0n,
            creator: creator || "",
            title: title || "",
            description: description || "",
            totalreward: totalreward || 0n,
            deadline: deadline || 0n,
            status: Number(status) || 0,
            createdAt: createdAt || 0n,
          }}
          taskWorker={taskWorker || ""}
        />

        {/* 里程碑列表 */}
        {mutableMilestones.length > 0 && (
          <MilestonesList
            milestones={mutableMilestones}
            isTaskCreator={!!isTaskCreator}
            isTaskWorker={!!isTaskWorker}
            onApproveMilestone={handleApproveMilestone}
            onPayMilestone={handlePayMilestone}
            onSubmitProof={handleSubmitProof}
          />
        )}

        {/* 工作量证明提交模态框 */}
        <SubmitProofModal
          isOpen={isProofModalOpen}
          onClose={() => {
            setIsProofModalOpen(false);
            setSelectedMilestoneIndex(null);
          }}
          taskId={taskId}
          milestoneIndex={selectedMilestoneIndex}
          onSubmitProof={handleSubmitMilestoneProof}
        />

        {/* 操作区：延长截止日期和增加奖励同一行 */}
        {isTaskCreator && (
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex-1 min-w-[220px]">
              <ExtendDeadline taskId={taskId} currentDeadline={deadline} onSuccess={refetchTask} />
            </div>
            <div className="flex-1 min-w-[220px]">
              <IncreaseReward taskId={taskId} onSuccess={refetchTask} />
            </div>
          </div>
        )}

        {/* 添加工作者模态框 */}
        <AddWorkerModal
          isOpen={isAddWorkerModalOpen}
          onClose={() => setIsAddWorkerModalOpen(false)}
          taskId={taskId}
          onAddWorker={handleAddWorker}
        />

        {/* 添加里程碑模态框 */}
        <AddMilestoneModal
          isOpen={isAddMilestoneModalOpen}
          onClose={() => setIsAddMilestoneModalOpen(false)}
          taskId={taskId}
          onAddMilestone={handleAddMilestone}
        />
      </div>
    </div>
  );
};

export default MilestoneTaskDetailPage;
