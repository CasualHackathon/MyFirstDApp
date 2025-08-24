"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import {
  useReadTeamEconomyPendingIdo,
  useReadTeamManagerAccountTeam,
  useReadTeamManagerNextTeamId,
} from "../contracts/generated";

import { apiClient } from "../api";

// Hook to get all teams
export function useTeams() {
  const { address } = useAccount();
  const { data, isLoading: isLoadingAPI } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await apiClient.teams.$get();
      return res.json();
    },
  });
  const { data: userTeamId, isLoading: isLoadingUserTeamId } =
    useReadTeamManagerAccountTeam({
      args: [address ?? "0x0000000000000000000000000000000000000000"],
    });

  const rankedTeams = useMemo(() => {
    if (!data) return [];

    return data.map((team) => {
      const { leverage, dividendVault } = team;
      return {
        ...team,
        leverage: BigInt(leverage),
        dividendVault: {
          ...dividendVault,
          totalBalance: BigInt(dividendVault.totalBalance),
          // userClaimable: BigInt(dividendVault.userClaimable),
        },
        isUserTeam: Number(userTeamId) === team.id,
      };
    });
  }, [data, userTeamId]);

  return {
    teams: rankedTeams,
    isLoading: isLoadingAPI || isLoadingUserTeamId,
  };
}

// Hook to get user's pending rewards for a specific team
export function useUserPendingRewards(teamId: number) {
  const { address } = useAccount();

  const { data: pendingIdo } = useReadTeamEconomyPendingIdo({
    args: [
      BigInt(teamId),
      address ?? "0x0000000000000000000000000000000000000000",
    ],
  });

  return useMemo(() => {
    if (!pendingIdo) return 0;
    return Number(pendingIdo) / 10 ** 18; // Convert from wei
  }, [pendingIdo]);
}
