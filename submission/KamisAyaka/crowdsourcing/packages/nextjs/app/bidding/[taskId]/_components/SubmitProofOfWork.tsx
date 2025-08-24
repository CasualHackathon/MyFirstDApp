import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface SubmitProofOfWorkProps {
  taskId: bigint;
  taskDeadline: bigint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubmitProofOfWork = ({ taskId, taskDeadline, isOpen, onClose, onSuccess }: SubmitProofOfWorkProps) => {
  const { address: connectedAddress } = useAccount();
  const [proof, setProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { writeContractAsync: submitProofOfWork } = useScaffoldWriteContract({ contractName: "BiddingTask" });

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proof.trim()) {
      return;
    }

    // 检查是否已经超过截止日期
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    if (currentTime > taskDeadline) {
      return;
    }

    try {
      setIsSubmitting(true);

      await submitProofOfWork({
        functionName: "submitProofOfWork",
        args: [taskId, proof],
      });

      // 清空输入框
      setProof("");

      if (onSuccess) {
        onSuccess();
      }

      // 关闭模态框
      onClose();
    } catch (e) {
      console.error("Error submitting proof:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 检查是否已经超过截止日期
  const isPastDeadline = BigInt(Math.floor(Date.now() / 1000)) > taskDeadline;

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h2 className="card-title text-2xl mb-4">提交工作量证明</h2>
        <p className="text-sm text-gray-500 mb-4">
          作为任务的工作者，您可以在此提交工作量证明。在任务截止日期前，您可以多次提交更新您的工作量证明。
        </p>

        <form onSubmit={handleSubmitProof}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">工作量证明</span>
            </label>
            <textarea
              placeholder="详细描述您的工作内容、完成情况等"
              className="textarea textarea-bordered w-full"
              rows={4}
              value={proof}
              onChange={e => setProof(e.target.value)}
              disabled={isPastDeadline}
              required
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>
              取消
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting || isPastDeadline || !connectedAddress}
            >
              {isPastDeadline ? "已超过截止日期" : isSubmitting ? "提交中..." : "提交"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
