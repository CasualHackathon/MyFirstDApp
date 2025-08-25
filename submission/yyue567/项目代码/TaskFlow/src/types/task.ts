// 任务数据结构
export interface Task {
  id: number;
  userId: number;
  amount: string; // ETH 格式的金额
  deadline: string;
  user: string; // 发布者地址
  title: string;
  description: string;
  acceptedBy: string[]; // 接受任务的用户地址列表
}

// 创建任务的参数
export interface CreateTaskParams {
  amount: string; // ETH 格式的金额
  deadline: string;
  title: string;
  description: string;
}

// 任务状态
export enum TaskStatus {
  OPEN = 'open',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  EXPIRED = 'expired'
}
