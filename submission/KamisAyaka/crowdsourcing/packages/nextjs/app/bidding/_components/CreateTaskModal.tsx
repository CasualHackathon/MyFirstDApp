import { useState } from "react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, deadline: number) => void;
}

export const CreateTaskModal = ({ isOpen, onClose, onCreate }: CreateTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(0);

  const handleSubmit = () => {
    // 将天数转换为秒数（区块链使用秒作为时间单位）
    const deadlineInSeconds = deadline * 24 * 60 * 60;
    onCreate(title, description, deadlineInSeconds);

    // 清空表单
    setTitle("");
    setDescription("");
    setDeadline(0);
  };

  const handleClose = () => {
    // 清空表单
    setTitle("");
    setDescription("");
    setDeadline(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">创建新任务</h3>
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">任务标题</span>
            </label>
            <input
              type="text"
              placeholder="输入任务标题"
              className="input input-bordered w-full"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">任务描述</span>
            </label>
            <textarea
              placeholder="详细描述任务要求"
              className="textarea textarea-bordered w-full"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">截止时间 (天)</span>
            </label>
            <input
              type="number"
              placeholder="任务截止时间（天）"
              className="input input-bordered w-full"
              value={deadline || ""}
              onChange={e => setDeadline(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleSubmit}>
            创建任务
          </button>
          <button className="btn" onClick={handleClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
