"use client";

import { useEffect, useState } from "react";
import { CreateTaskModal } from "./_components/CreateTaskModal";
import { TaskCard } from "./_components/TaskCard";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const BiddingTasksPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  // 读取合约信息
  const {
    data: taskCounter,
    isLoading: isTaskCounterLoading,
    refetch: refetchTaskCounter,
  } = useScaffoldReadContract({
    contractName: "BiddingTask",
    functionName: "taskCounter",
  });

  const { data: platformFee } = useScaffoldReadContract({
    contractName: "BiddingTask",
    functionName: "platformFee",
  });

  // 写入合约功能 - 使用推荐的对象参数版本
  const [taskIds, setTaskIds] = useState<bigint[]>([]);

  const { writeContractAsync: createTask } = useScaffoldWriteContract({ contractName: "BiddingTask" });

  // 当任务计数改变时，更新任务ID列表
  useEffect(() => {
    if (taskCounter && taskCounter > 0n) {
      const ids = [];
      for (let i = 1n; i <= taskCounter; i++) {
        ids.push(i);
      }
      setTaskIds(ids);
    } else {
      setTaskIds([]);
    }
  }, [taskCounter]);

  const handleCreateTask = async (title: string, description: string, deadline: number) => {
    if (!title || !description || deadline <= 0) {
      return;
    }

    try {
      await createTask({
        functionName: "createTask",
        args: [title, description, BigInt(Math.floor(Date.now() / 1000) + deadline)],
      });
      // 重新获取任务计数
      refetchTaskCounter();

      // 关闭模态框
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error creating task:", e);
    }
  };

  // 获取状态筛选选项
  const statusOptions = [
    { value: 0, label: "Open" },
    { value: 1, label: "InProgress" },
    { value: 2, label: "Completed" },
    { value: 3, label: "Paid" },
    { value: 4, label: "Cancelled" },
  ];

  return (
    <div className="flex flex-col items-center pt-10 px-4">
      {/* 我的任务部分 */}
      <div className="w-full max-w-6xl mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">竞标任务列表</h2>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            创建新任务
          </button>
        </div>

        {/* 状态筛选器 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => (
              <button
                key={option.label}
                className={`btn btn-sm ${selectedStatus === option.value ? "btn-primary" : "btn-outline"}`}
                onClick={() => setSelectedStatus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isTaskCounterLoading ? (
            <div className="col-span-full text-center py-10">
              <span className="loading loading-spinner loading-lg">加载中...</span>
            </div>
          ) : taskIds.length > 0 ? (
            taskIds.map(taskId => (
              <TaskCard key={`task-${taskId.toString()}`} taskId={taskId} selectedStatus={selectedStatus} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">暂无任务</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 w-full max-w-6xl mb-8">
        <h2 className="text-2xl font-bold mb-6">功能说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-base-200 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2">创建任务</h3>
            <p className="text-sm">
              任务创建者可以创建一个竞标任务，指定任务标题、描述和截止时间。
              创建任务时需要预存预算，工作者可以提交竞标。任务创建者可以从竞标者中选择合适的工作者，
              每个竞标任务只能分配给一个工作者，适合一对多的竞争性合作场景。
            </p>
          </div>
          <div className="bg-base-200 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2">工作者流程</h3>
            <p className="text-sm">
              工作者可以查看并竞标已创建的任务，提交竞标时需要说明完成任务所需的酬劳和大概需要的时间。
              任务创建者选择工作者后，被选中的工作者可以接受任务。
              完成任务后，工作者可以提交工作量证明等待任务创建者验证。
            </p>
          </div>
          <div className="bg-base-200 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2">任务验证与支付</h3>
            <p className="text-sm">
              任务创建者可以验证工作者提交的工作量证明，验证通过后任务状态将更新为完成状态。
              工作者随后可以调用支付功能领取报酬，系统会自动扣除平台费用后将剩余报酬转账给工作者。
            </p>
          </div>
          <div className="bg-base-200 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2">纠纷处理</h3>
            <p className="text-sm">
              如果任务创建者和工作者之间产生争议，无论是任务创建者对工作量证明不满意还是工作者认为报酬不合理，
              双方都可以在满足条件后发起纠纷。纠纷将由专门的纠纷解决合约处理，
              由管理员投票决定资金的最终分配方案，确保交易的公平性。
            </p>
          </div>
        </div>
      </div>

      <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 w-full max-w-6xl mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">任务概览</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-base-200 p-4 rounded-xl">
            <p className="text-sm text-gray-500">总任务数</p>
            <p className="text-2xl font-bold">
              {isTaskCounterLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                `#${taskCounter?.toString() || "0"}`
              )}
            </p>
          </div>
          <div className="bg-base-200 p-4 rounded-xl">
            <p className="text-sm text-gray-500">平台费用</p>
            <p className="text-2xl font-bold">{platformFee ? (Number(platformFee) / 100).toString() : "0"}%</p>
          </div>
          <div className="bg-base-200 p-4 rounded-xl">
            <p className="text-sm text-gray-500">任务类型</p>
            <p className="text-2xl font-bold">竞标任务</p>
          </div>
        </div>
      </div>

      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateTask} />
    </div>
  );
};

export default BiddingTasksPage;
