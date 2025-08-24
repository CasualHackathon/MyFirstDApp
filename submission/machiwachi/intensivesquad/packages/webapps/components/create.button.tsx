"use client";

import { Button } from "@/components/retroui/Button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateClanDialog } from "../app/leaderboard/create-clan.dialog";
import { useSession } from "next-auth/react";

export const CreateButton = () => {
  const [showCreateClan, setShowCreateClan] = useState(false);
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <>
      <Button
        onClick={() => setShowCreateClan(true)}
        variant="outline"
        className="  flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        创建部落
      </Button>

      <CreateClanDialog
        open={showCreateClan}
        onOpenChange={setShowCreateClan}
      />
    </>
  );
};
