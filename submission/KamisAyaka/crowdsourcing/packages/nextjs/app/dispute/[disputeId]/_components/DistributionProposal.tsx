"use client";

interface DistributionProposalProps {
  disputeData: any;
  distributionProposal: any;
  canApprove: boolean;
  canDistribute: boolean;
  canReject: boolean;
  isApproving: boolean;
  isDistributing: boolean;
  isRejecting: boolean;
  isWorker: boolean;
  handleApprove: () => void;
  handleDistribute: () => void;
  handleReject: () => void;
}

export const DistributionProposal = ({
  disputeData,
  distributionProposal,
  canApprove,
  canDistribute,
  canReject,
  isApproving,
  isDistributing,
  isRejecting,
  isWorker,
  handleApprove,
  handleDistribute,
  handleReject,
}: DistributionProposalProps) => {
  const disputeStatus = disputeData ? Number(disputeData.status) : -1;

  return (
    <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">分配方案</h2>

      {disputeStatus === 1 && distributionProposal && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">工作者份额</p>
              <p className="font-bold">
                {distributionProposal[0] ? (Number(distributionProposal[0]) / 1e18).toFixed(2) : "0.00"} TST
              </p>
            </div>
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">创建者份额</p>
              <p className="font-bold">
                {disputeData.rewardAmount && distributionProposal[0]
                  ? (Number(disputeData.rewardAmount - distributionProposal[0]) / 1e18).toFixed(2)
                  : "0.00"}{" "}
                TST
              </p>
            </div>
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">工作者批准</p>
              <p className={`${distributionProposal[1] ? "text-green-500" : "text-red-500"} font-bold`}>
                {distributionProposal[1] ? "已批准" : "未批准"}
              </p>
            </div>
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">创建者批准</p>
              <p className={`${distributionProposal[2] ? "text-green-500" : "text-red-500"} font-bold`}>
                {distributionProposal[2] ? "已批准" : "未批准"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {canApprove && (
              <button
                className={`btn btn-primary ${isApproving ? "loading" : ""}`}
                onClick={handleApprove}
                disabled={isApproving}
              >
                {isApproving ? "批准中..." : isWorker ? "工作者批准" : "创建者批准"}
              </button>
            )}
            {canDistribute && (
              <button
                className={`btn btn-success ${isDistributing ? "loading" : ""}`}
                onClick={handleDistribute}
                disabled={isDistributing}
              >
                {isDistributing ? "分配中..." : "分配资金"}
              </button>
            )}
            {canReject && (
              <button
                className={`btn btn-error ${isRejecting ? "loading" : ""}`}
                onClick={handleReject}
                disabled={isRejecting}
              >
                {isRejecting ? "拒绝中..." : "拒绝提案"}
              </button>
            )}
          </div>
        </>
      )}

      {disputeStatus === 2 && distributionProposal && (
        <>
          <div className="text-center py-4 mb-6">
            <p className="text-green-500 font-bold">资金已分配完成</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">工作者份额</p>
              <p className="font-bold">
                {distributionProposal[0] ? (Number(distributionProposal[0]) / 1e18).toFixed(2) : "0.00"} TST
              </p>
            </div>
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">创建者份额</p>
              <p className="font-bold">
                {disputeData.rewardAmount && distributionProposal[0]
                  ? (Number(disputeData.rewardAmount - distributionProposal[0]) / 1e18).toFixed(2)
                  : "0.00"}{" "}
                TST
              </p>
            </div>
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">工作者批准</p>
              <p className={`${distributionProposal[1] ? "text-green-500" : "text-red-500"} font-bold`}>
                {distributionProposal[1] ? "已批准" : "未批准"}
              </p>
            </div>
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">创建者批准</p>
              <p className={`${distributionProposal[2] ? "text-green-500" : "text-red-500"} font-bold`}>
                {distributionProposal[2] ? "已批准" : "未批准"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
