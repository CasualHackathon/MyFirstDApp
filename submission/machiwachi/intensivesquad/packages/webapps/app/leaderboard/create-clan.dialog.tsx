"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/retroui/Dialog";

import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import { Textarea } from "@/components/retroui/Textarea";
import { apiClient } from "@/lib/api";
import {
  teamManagerConfig,
  useWriteTeamManagerCreateTeam,
  useWriteTeamManagerJoin,
} from "@/lib/contracts";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { parseEventLogs } from "viem";
import { usePublicClient, useWaitForTransactionReceipt } from "wagmi";

export function CreateClanDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    data: createHash,
    writeContractAsync: createTeamAsync,
    reset,
  } = useWriteTeamManagerCreateTeam();
  const {
    data: joinHash,
    writeContractAsync: joinAsync,
    reset: resetJoinContract,
  } = useWriteTeamManagerJoin();
  const { isLoading: isCreating, isSuccess: isCreated } =
    useWaitForTransactionReceipt({
      hash: createHash,
    });
  const { isLoading: isJoining, isSuccess: isJoined } =
    useWaitForTransactionReceipt({
      hash: joinHash,
    });
  const publicClient = usePublicClient();

  const [newClanForm, setNewClanForm] = useState({
    name: "",
    flag: "",
    description: "",
    initialLeverage: "1.0",
  });

  const handleCreateClan = async (event: React.FormEvent) => {
    event.preventDefault();

    // In a real app, this would create the clan on the blockchain
    console.log("[v0] Creating new clan:", newClanForm);

    // Reset form and close dialog
    setNewClanForm({
      name: "",
      flag: "",
      description: "",
      initialLeverage: "1.0",
    });

    if (!publicClient) return;

    const createTx = await createTeamAsync({
      args: [newClanForm.name],
    });

    const createReceipt = await publicClient.waitForTransactionReceipt({
      hash: createTx,
    });
    const logs = parseEventLogs({
      abi: teamManagerConfig.abi,
      eventName: "TeamCreated",
      logs: createReceipt.logs,
    });

    const { teamId, name } = logs[0].args;

    const joinTx = await joinAsync({
      args: [teamId],
    });

    const verifyRes = await apiClient.members.events.$post({
      json: {
        txHash: joinTx,
      },
    });

    toast.success(`部落 ${name} 创建成功`, {
      description: "请等待 5 秒后自动关闭",
    });

    setTimeout(() => {
      onOpenChange(false);
      reset();
      resetJoinContract();
    }, 5000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg ">
        <DialogHeader>
          <div className=" text-2xl flex items-center gap-2">
            <Plus className="w-6 h-6" />
            创建新部落{" "}
          </div>
          {/* <pre>
            {JSON.stringify(
              {
                isConfirmed,
                hash,
                isConfirming,
              },
              null,
              2
            )}
          </pre> */}
        </DialogHeader>

        <form onSubmit={handleCreateClan} className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="clan-name" className="">
              部落名称
            </Label>
            <Input
              id="clan-name"
              value={newClanForm.name}
              onChange={(e) =>
                setNewClanForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="输入部落名称"
              required
              maxLength={30}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clan-flag" className="">
              部落旗帜（Emoji）
            </Label>
            <Input
              id="clan-flag"
              value={newClanForm.flag}
              onChange={(e) =>
                setNewClanForm((prev) => ({ ...prev, flag: e.target.value }))
              }
              placeholder="🏴‍☠️"
              className="  text-center text-2xl"
              maxLength={2}
            />
            <p className="text-xs text-muted-foreground ">
              选择一个表情符号作为部落旗帜
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clan-description" className="">
              描述（可选）
            </Label>
            <Textarea
              id="clan-description"
              value={newClanForm.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewClanForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="描述你们部落的使命与价值观..."
              className="  resize-none"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="bg-muted/20 p-3 rounded ">
            <h4 className=" font-bold text-sm mb-2">创建成本</h4>
            <div className="flex items-center justify-between text-sm ">
              <span>平台费用：</span>
              <span className="font-bold">0.1 ETH</span>
            </div>
            <div className="flex items-center justify-between text-sm ">
              <span>初始金库存入：</span>
              <span className="font-bold">0.5 ETH</span>
            </div>
            <hr className="my-2 border-muted" />
            <div className="flex items-center justify-between text-sm  font-bold">
              <span>合计：</span>
              <span>0.6 ETH</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
              className="flex-1 "
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!newClanForm.name || isCreating}
              className="flex-1  "
            >
              {isCreating ? "创建中..." : "创建部落"}
            </Button>
          </div>

          {isCreated && <div className="flex items-center gap-2">成功创建</div>}
          {isJoining && (
            <div className="flex items-center gap-2">加入中...</div>
          )}
          {isJoined && <div className="flex items-center gap-2">成功加入</div>}
        </form>
      </DialogContent>
    </Dialog>
  );
}
