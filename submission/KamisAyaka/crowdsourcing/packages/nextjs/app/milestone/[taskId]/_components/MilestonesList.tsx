import { formatUnits } from "viem";

interface Milestone {
  description: string;
  reward: bigint;
  paid: boolean;
  completedAt: bigint;
  workProof: {
    proof: string;
    submitted: boolean;
    approved: boolean;
    submittedAt: bigint;
  };
}

interface MilestonesListProps {
  milestones: Milestone[];
  isTaskCreator: boolean;
  isTaskWorker: boolean;
  onApproveMilestone: (index: number) => void;
  onPayMilestone: (index: number) => void;
  onSubmitProof: (index: number) => void;
}

export const MilestonesList = ({
  milestones,
  isTaskCreator,
  isTaskWorker,
  onApproveMilestone,
  onPayMilestone,
  onSubmitProof,
}: MilestonesListProps) => {
  if (milestones.length === 0) return null;

  return (
    <div className="card bg-base-100 shadow-xl mb-6">
      <div className="card-body">
        <h2 className="card-title">里程碑</h2>
        <div className="space-y-4">
          {milestones.map((milestone, index) => {
            const { description, reward, paid, completedAt, workProof } = milestone;
            const { proof, submitted, approved, submittedAt } = workProof;

            return (
              <div key={index} className="border border-base-300 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{description}</h3>
                    <p className="text-sm text-gray-500 mt-1">报酬: {formatUnits(reward, 18)} TST</p>
                  </div>
                  <div className="flex flex-col items-end">
                    {paid ? (
                      <span className="badge badge-success">已支付</span>
                    ) : approved ? (
                      <span className="badge badge-info">已批准</span>
                    ) : submitted ? (
                      <span className="badge badge-warning">待批准</span>
                    ) : (
                      <span className="badge badge-ghost">未提交</span>
                    )}
                    {completedAt > 0n && (
                      <span className="text-xs text-gray-500 mt-1">
                        完成于: {new Date(Number(completedAt) * 1000).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {submitted && (
                  <div className="mt-3 pt-3 border-t border-base-200">
                    <p className="text-sm font-bold">工作量证明:</p>
                    <p className="text-sm mt-1">{proof}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      提交时间: {new Date(Number(submittedAt) * 1000).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="card-actions justify-end mt-3">
                  {isTaskCreator && submitted && !approved && !paid && (
                    <button className="btn btn-sm btn-primary" onClick={() => onApproveMilestone(index)}>
                      批准里程碑
                    </button>
                  )}
                  {isTaskWorker && approved && !paid && (
                    <button className="btn btn-sm btn-secondary" onClick={() => onPayMilestone(index)}>
                      领取奖励
                    </button>
                  )}
                  {isTaskWorker && !submitted && (
                    <button className="btn btn-sm btn-primary" onClick={() => onSubmitProof(index)}>
                      提交证明
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
