import Link from "next/link";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface TaskCardProps {
  taskId: bigint;
  selectedStatus?: number | null;
}

export const TaskCard = ({ taskId, selectedStatus }: TaskCardProps) => {
  // 从链上获取任务详情
  const { data: task, isLoading: isTaskLoading } = useScaffoldReadContract({
    contractName: "FixedPaymentTask",
    functionName: "tasks",
    args: [taskId],
  });

  const formatDeadline = (deadline: bigint) => {
    const date = new Date(Number(deadline) * 1000);
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
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body flex items-center justify-center h-full">
          <span className="loading loading-spinner"></span>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  // 解构任务数据 (tasks映射返回一个数组)
  const creator = task[1];
  const title = task[2];
  const description = task[3];
  const deadline = task[5];
  const status = task[6];

  // 如果有状态筛选且当前任务状态不匹配，则不显示该任务
  // 如果没有指定筛选状态，默认只显示Open状态的任务
  if (selectedStatus !== undefined && selectedStatus !== null) {
    if (selectedStatus !== Number(status)) {
      return null;
    }
  } else {
    // 默认只显示Open状态的任务
    if (Number(status) !== 0) {
      return null;
    }
  }

  // 截取描述的前100个字符作为简短描述
  const shortDescription = description.length > 100 ? description.substring(0, 100) + "..." : description;

  return (
    <Link
      href={`/fixed-payment/${taskId.toString()}`}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-base-300"
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="card-title text-lg">{title}</h3>
            <p className="text-xs text-gray-500 mb-2">任务ID: #{taskId.toString()}</p>
          </div>
          <span className={`badge ${getStatusColor(Number(status))} badge-sm`}>{getStatusText(Number(status))}</span>
        </div>

        <p className="text-sm mb-2">{shortDescription}</p>

        <div className="text-xs text-gray-500 flex justify-between">
          <span>截止时间:</span>
          <span>{formatDeadline(deadline)}</span>
        </div>

        <div className="mt-2 text-xs">
          <span className="text-gray-500">创建者: </span>
          <Address address={creator} format="short" disableAddressLink />
        </div>
      </div>
    </Link>
  );
};
