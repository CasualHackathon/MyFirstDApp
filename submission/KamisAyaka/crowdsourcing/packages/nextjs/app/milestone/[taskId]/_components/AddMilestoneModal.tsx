import { useState } from "react";
import { InputBase } from "~~/components/scaffold-eth";

interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onAddMilestone: (description: string, reward: string) => void;
}

export const AddMilestoneModal = ({ isOpen, onClose, onAddMilestone }: AddMilestoneModalProps) => {
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !reward) {
      alert("请填写所有字段");
      return;
    }

    // 检查奖励值是否为有效数字
    const rewardValue = parseFloat(reward);
    if (isNaN(rewardValue) || rewardValue <= 0) {
      alert("请输入有效的奖励值");
      return;
    }

    try {
      setIsSubmitting(true);
      onAddMilestone(description, reward);

      // 重置表单
      setDescription("");
      setReward("");
    } catch (e) {
      console.error("Error adding milestone:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">添加里程碑</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-bold">里程碑描述</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="输入里程碑描述"
              className="textarea textarea-bordered w-full"
              rows={4}
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-bold">里程碑报酬 (TST)</span>
            </label>
            <InputBase value={reward} onChange={value => setReward(value)} placeholder="输入里程碑报酬" />
            <div className="text-xs text-gray-500 mt-1">
              输入数字，单位为TST代币。例如：输入1表示1个TST代币（即10^18个最小单位）
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>
              取消
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "添加中..." : "添加里程碑"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
