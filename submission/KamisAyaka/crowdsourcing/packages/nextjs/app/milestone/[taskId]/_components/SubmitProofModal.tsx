import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface SubmitProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  milestoneIndex: number | null;
  onSubmitProof?: (proof: string) => void;
}

export const SubmitProofModal = ({ isOpen, onClose, taskId, milestoneIndex, onSubmitProof }: SubmitProofModalProps) => {
  const [proof, setProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContractAsync: submitMilestoneProofOfWork } = useScaffoldWriteContract({
    contractName: "MilestonePaymentTask",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proof) {
      alert("请填写工作量证明");
      return;
    }

    try {
      setIsSubmitting(true);

      if (onSubmitProof) {
        onSubmitProof(proof);
      } else {
        await submitMilestoneProofOfWork({
          functionName: "submitMilestoneProofOfWork",
          args: [BigInt(taskId), BigInt(milestoneIndex!), proof],
        });
        setProof("");
        onClose();
      }
    } catch (e) {
      console.error("Error submitting proof:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || milestoneIndex === null) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">提交工作量证明</h3>
        <p className="text-sm text-gray-500 mb-4">里程碑 #{milestoneIndex + 1}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-bold">工作量证明</span>
            </label>
            <textarea
              value={proof}
              onChange={e => setProof(e.target.value)}
              placeholder="描述完成的工作"
              className="textarea textarea-bordered w-full"
              rows={6}
            />
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
              {isSubmitting ? "提交中..." : "提交证明"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
