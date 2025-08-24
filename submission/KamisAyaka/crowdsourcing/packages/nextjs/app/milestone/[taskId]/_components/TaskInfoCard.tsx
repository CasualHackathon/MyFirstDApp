import { formatUnits } from "viem";
import { Address } from "~~/components/scaffold-eth";

interface Task {
  id?: bigint;
  creator: string;
  title: string;
  description: string;
  totalreward: bigint;
  deadline: bigint;
  status: number;
  createdAt: bigint;
}

interface TaskInfoCardProps {
  task: Task;
  taskWorker?: string;
}

export const TaskInfoCard = ({ task, taskWorker }: TaskInfoCardProps) => {
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
      case 3: // Paid
        return "badge-primary";
      case 4: // Cancelled
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  const { id, creator, title, description, totalreward, deadline, status, createdAt } = task;

  return (
    <div className="card bg-base-100 shadow-2xl border border-base-300 rounded-3xl">
      <div className="card-body">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <h1 className="card-title text-3xl font-bold mb-2 text-primary">{title}</h1>
            <span className={`badge ${getStatusColor(status)} badge-lg text-base mt-2`}>{getStatusText(status)}</span>
            <div className="mt-4 bg-base-200 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">任务描述</p>
              <p className="mt-1 text-base leading-relaxed">{description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 min-w-[180px] items-end">
            {id && (
              <div className="bg-base-200 rounded-xl p-3 w-full">
                <div className="text-xs text-gray-500">任务ID</div>
                <div className="font-mono text-lg">#{id.toString()}</div>
              </div>
            )}
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
  );
};
