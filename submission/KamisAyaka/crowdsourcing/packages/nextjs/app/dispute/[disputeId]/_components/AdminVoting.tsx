"use client";

import { Address } from "~~/components/scaffold-eth";

interface AdminVotingProps {
  disputeData: any;
  canVote: boolean;
  canProcess: boolean;
  hasVoted: boolean;
  isVoting: boolean;
  isProcessingVotes: boolean;
  voteAmount: string;
  setVoteAmount: (value: string) => void;
  handleVote: () => void;
  handleProcessVotes: () => void;
}

export const AdminVoting = ({
  disputeData,
  canVote,
  canProcess,
  hasVoted,
  isVoting,
  isProcessingVotes,
  voteAmount,
  setVoteAmount,
  handleVote,
  handleProcessVotes,
}: AdminVotingProps) => {
  return (
    <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">管理员投票</h2>

      {canVote && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">分配给工作者的金额 (TST)</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="投票金额"
              className="input input-bordered w-full"
              value={voteAmount}
              onChange={e => setVoteAmount(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              className={`btn btn-primary w-full ${isVoting ? "loading" : ""}`}
              onClick={handleVote}
              disabled={isVoting || hasVoted}
            >
              {isVoting ? "投票中..." : hasVoted ? "已投票" : "提交投票"}
            </button>
          </div>
        </div>
      )}

      {canProcess && (
        <div className="mb-6">
          <button
            className={`btn btn-secondary ${isProcessingVotes ? "loading" : ""}`}
            onClick={handleProcessVotes}
            disabled={isProcessingVotes}
          >
            {isProcessingVotes ? "处理中..." : "处理投票结果"}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            当前投票数: {disputeData.votes?.length || 0} (至少需要3票才能处理)
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <h3 className="text-xl font-bold mb-3">当前投票</h3>
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>管理员地址</th>
              <th>工作者份额</th>
            </tr>
          </thead>
          <tbody>
            {disputeData.votes && disputeData.votes.length > 0 ? (
              disputeData.votes.map((vote: any, index: number) => (
                <tr key={index}>
                  <td>
                    <Address address={vote.admin} />
                  </td>
                  <td>{vote.workerShare ? (Number(vote.workerShare) / 1e18).toFixed(2) : "0.00"} TST</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center text-gray-500">
                  暂无投票
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
