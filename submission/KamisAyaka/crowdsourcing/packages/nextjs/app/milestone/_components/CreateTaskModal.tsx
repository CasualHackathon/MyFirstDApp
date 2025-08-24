import { useState } from "react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, deadline: number) => void;
}

export const CreateTaskModal = ({ isOpen, onClose, onCreate }: CreateTaskModalProps) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 将天数转换为秒数（1天 = 24小时 = 86400秒）
    onCreate(taskTitle, taskDescription, taskDeadline * 86400);
    // 重置表单
    setTaskTitle("");
    setTaskDescription("");
    setTaskDeadline(0);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">创建新任务</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-bold">任务标题</span>
            </label>
            <input
              type="text"
              placeholder="输入任务标题"
              className="input input-bordered w-full"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-bold">任务描述</span>
            </label>
            <textarea
              placeholder="详细描述任务要求"
              className="textarea textarea-bordered w-full"
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-bold">截止时间 (天)</span>
            </label>
            <input
              type="number"
              placeholder="任务截止时间（天）"
              className="input input-bordered w-full"
              value={taskDeadline || ""}
              onChange={e => setTaskDeadline(Number(e.target.value))}
              min="1"
              required
            />
          </div>

          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              创建任务
            </button>
            <button type="button" className="btn" onClick={onClose}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
