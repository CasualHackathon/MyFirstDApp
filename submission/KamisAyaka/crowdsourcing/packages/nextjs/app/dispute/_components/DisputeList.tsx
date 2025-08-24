"use client";

import { useState } from "react";
import Link from "next/link";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

/**
 * 纠纷列表组件
 */
export const DisputeList = () => {
  const [activeTab, setActiveTab] = useState<"filed" | "resolved" | "distributed">("filed");

  // 获取纠纷计数器
  // const { data: disputeCounter } = useScaffoldReadContract({
  //   contractName: "DisputeResolver",
  //   functionName: "disputeCounter",
  // });

  // 定义纠纷类型

  // 获取所有纠纷信息
  const {
    data: disputesData,
    isLoading,
    isError,
  } = useScaffoldReadContract({
    contractName: "DisputeResolver",
    functionName: "getAllDisputes",
  });

  // 处理纠纷数据
  const disputes = disputesData
    ? disputesData.map((dispute: any, index: number) => ({
        id: index,
        taskId: Number(dispute.taskId),
        rewardAmount: `${(Number(dispute.rewardAmount) / 1e18).toFixed(2)} TST`,
        filedAt: new Date(Number(dispute.filedAt) * 1000).toLocaleString(),
        status: Number(dispute.status),
        taskContract: dispute.taskContract,
        worker: dispute.worker,
        taskCreator: dispute.taskCreator,
      }))
    : [];

  // 根据当前标签过滤纠纷
  const filteredDisputes = disputes.filter((dispute: any) => {
    if (activeTab === "filed") return dispute.status === 0;
    if (activeTab === "resolved") return dispute.status === 1;
    if (activeTab === "distributed") return dispute.status === 2;
    return true;
  });

  /**
   * 获取状态显示文本
   */
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "已提交";
      case 1:
        return "已解决";
      case 2:
        return "已分配";
      default:
        return "未知";
    }
  };

  /**
   * 获取状态徽章颜色
   */
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: // Filed
        return "badge-warning";
      case 1: // Resolved
        return "badge-info";
      case 2: // Distributed
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">纠纷列表</h2>
        </div>
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">正在加载纠纷数据...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">纠纷列表</h2>
        </div>
        <div className="text-center py-8 text-error">
          <p>加载纠纷数据时出错</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">纠纷列表</h2>
        <div className="tabs tabs-boxed">
          <button className={`tab ${activeTab === "filed" ? "tab-active" : ""}`} onClick={() => setActiveTab("filed")}>
            已提交
          </button>
          <button
            className={`tab ${activeTab === "resolved" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("resolved")}
          >
            已解决
          </button>
          <button
            className={`tab ${activeTab === "distributed" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("distributed")}
          >
            已分配
          </button>
        </div>
      </div>

      {disputes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">暂无纠纷数据</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>纠纷ID</th>
                <th>任务ID</th>
                <th>奖励金额</th>
                <th>提交时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredDisputes.map((dispute: any) => (
                <tr key={dispute.id}>
                  <td>#{dispute.id}</td>
                  <td>#{dispute.taskId}</td>
                  <td>{dispute.rewardAmount}</td>
                  <td>{dispute.filedAt}</td>
                  <td>
                    <span className={`badge ${getStatusColor(dispute.status)} badge-sm`}>
                      {getStatusText(dispute.status)}
                    </span>
                  </td>
                  <td>
                    <Link href={`/dispute/${dispute.id}`} className="btn btn-sm btn-primary">
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
