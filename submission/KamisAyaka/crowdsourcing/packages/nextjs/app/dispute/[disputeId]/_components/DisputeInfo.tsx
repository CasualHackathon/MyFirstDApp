"use client";

import { Address } from "~~/components/scaffold-eth";

interface DisputeInfoProps {
  disputeId: string;
  disputeData: any;
  getStatusText: (status: number) => string;
  getStatusColor: (status: number) => string;
}

export const DisputeInfo = ({ disputeId, disputeData, getStatusText, getStatusColor }: DisputeInfoProps) => {
  return (
    <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 mb-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">纠纷 #{disputeId}</h2>
        <span className={`badge ${getStatusColor(Number(disputeData.status))} badge-lg`}>
          {getStatusText(Number(disputeData.status))}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-gray-500">任务ID</p>
          <p className="font-mono">#{disputeData.taskId?.toString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">提交时间</p>
          <p>{disputeData.filedAt ? new Date(Number(disputeData.filedAt) * 1000).toLocaleString() : "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">解决时间</p>
          <p>
            {disputeData.resolvedAt && Number(disputeData.resolvedAt) > 0
              ? new Date(Number(disputeData.resolvedAt) * 1000).toLocaleString()
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">奖励金额</p>
          <p className="font-bold">
            {disputeData.rewardAmount ? (Number(disputeData.rewardAmount) / 1e18).toFixed(2) : "0.00"} TST
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">任务合约</p>
          <Address address={disputeData.taskContract} />
        </div>
        <div>
          <p className="text-sm text-gray-500">工作者</p>
          <Address address={disputeData.worker} />
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">任务创建者</p>
          <Address address={disputeData.taskCreator} />
        </div>
      </div>

      <div className="form-control mb-6">
        <label className="label">
          <span className="label-text font-bold">工作量证明</span>
        </label>
        <div className="p-4 bg-base-200 rounded-lg">
          <p>{disputeData.proofOfWork || "无"}</p>
        </div>
      </div>
    </div>
  );
};
