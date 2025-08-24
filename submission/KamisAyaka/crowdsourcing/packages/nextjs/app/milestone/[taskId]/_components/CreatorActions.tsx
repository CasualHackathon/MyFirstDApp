import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface CreatorActionsProps {
  taskId: string;
  onAddWorkerClick: () => void;
  onAddMilestoneClick: () => void;
}

export const CreatorActions = ({ taskId, onAddWorkerClick, onAddMilestoneClick }: CreatorActionsProps) => {
  const { data: taskWorker } = useScaffoldReadContract({
    contractName: "MilestonePaymentTask",
    functionName: "taskWorker",
    args: [BigInt(taskId)],
  });

  return (
    <div className="card bg-base-100 shadow-xl mb-6">
      <div className="card-body">
        <h2 className="card-title">任务创建者操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <button className="btn btn-primary" onClick={onAddWorkerClick}>
            添加工作者
          </button>
          <button className="btn btn-primary" onClick={onAddMilestoneClick}>
            添加里程碑
          </button>
          {!taskWorker && (
            <button className="btn btn-secondary" onClick={onAddWorkerClick}>
              分配工作者
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
