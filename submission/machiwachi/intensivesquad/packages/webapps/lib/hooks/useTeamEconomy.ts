"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import {
  useReadIdoTokenBalanceOf,
  useReadTeamEconomyGetStageScalar,
  useReadTeamEconomyGetTeamL,
  useReadTeamEconomyLMax,
  useReadTeamEconomyLMin,
  useReadTeamEconomyPendingIdo,
  useReadTeamEconomyTeamWedoBalance,
  useReadTeamEconomyUserAccrued,
  useReadTeamEconomyUserShares,
  useReadTeamManagerAccountTeam,
} from "../contracts/generated";

export interface TeamEconomyData {
  teamId: number;
  teamWedoBalance: bigint;
  teamLeverage: bigint;
  userPendingIdo: bigint;
  userAccrued: bigint;
  userShares: number;
  stageScalar: bigint;
  lMin: bigint;
  lMax: bigint;
}

export interface UserTokenBalances {
  idoBalance: number;
  wedoBalance: number;
}

// Hook to get team economy data
export function useTeamEconomy(teamId: number) {
  const { address } = useAccount();

  const { data: teamWedoBalance, refetch: refetchTeamWedoBalance } =
    useReadTeamEconomyTeamWedoBalance({
      args: [BigInt(teamId)],
    });

  const { data: teamL } = useReadTeamEconomyGetTeamL({
    args: [BigInt(teamId)],
  });

  const { data: pendingIdo, refetch: refetchPendingIdo } =
    useReadTeamEconomyPendingIdo({
      args: [
        BigInt(teamId),
        address ?? "0x0000000000000000000000000000000000000000",
      ],
    });

  const { data: userAccrued, refetch: refetchUserAccrued } =
    useReadTeamEconomyUserAccrued({
      args: [
        BigInt(teamId),
        address ?? "0x0000000000000000000000000000000000000000",
      ],
    });

  const { data: userShares } = useReadTeamEconomyUserShares({
    args: [
      BigInt(teamId),
      address ?? "0x0000000000000000000000000000000000000000",
    ],
  });

  const { data: stageScalar } = useReadTeamEconomyGetStageScalar();
  const { data: lMin } = useReadTeamEconomyLMin();
  const { data: lMax } = useReadTeamEconomyLMax();

  const refetch = () => {
    refetchTeamWedoBalance();
    refetchPendingIdo();
    refetchUserAccrued();
  };

  return useMemo(() => {
    const economy: TeamEconomyData = {
      teamId,
      teamWedoBalance: teamWedoBalance ?? BigInt(0),
      teamLeverage: teamL ?? BigInt(0),
      userPendingIdo: pendingIdo ?? BigInt(0),
      userAccrued: userAccrued ?? BigInt(0),
      userShares: Number(userShares),
      stageScalar: stageScalar ?? BigInt(1),
      lMin: lMin ?? BigInt(1000),
      lMax: lMax ?? BigInt(1500),
    };

    return { data: economy, refetch };
  }, [
    teamId,
    teamWedoBalance,
    teamL,
    pendingIdo,
    userAccrued,
    userShares,
    stageScalar,
    lMin,
    lMax,
  ]);
}

// Hook to get user's token balances
export function useUserTokenBalances() {
  const { address } = useAccount();

  const {
    data: idoBalance,
    isLoading: isIdoBalanceLoading,
    isRefetching: isIdoBalanceRefetching,
  } = useReadIdoTokenBalanceOf({
    args: [address ?? "0x0000000000000000000000000000000000000000"],
  });

  const { data: userTeamId } = useReadTeamManagerAccountTeam({
    args: [address ?? "0x0000000000000000000000000000000000000000"],
  });
  const {
    data: wedoBalance,
    isLoading: isWedoBalanceLoading,
    isRefetching: isWedoBalanceRefetching,
  } = useReadTeamEconomyTeamWedoBalance({
    args: [BigInt(userTeamId ?? 0)],
  });

  return useMemo(() => {
    const balances = {
      idoBalance,
      wedoBalance,
      isIdoBalanceLoading,
      isWedoBalanceLoading,
      isIdoBalanceRefetching,
      isWedoBalanceRefetching,
    };

    return balances;
  }, [
    idoBalance,
    wedoBalance,
    isIdoBalanceLoading,
    isWedoBalanceLoading,
    isIdoBalanceRefetching,
    isWedoBalanceRefetching,
  ]);
}

// Hook to get global economy parameters
export function useGlobalEconomyParams() {
  const { data: stageScalar } = useReadTeamEconomyGetStageScalar();
  const { data: lMin } = useReadTeamEconomyLMin();
  const { data: lMax } = useReadTeamEconomyLMax();

  return useMemo(() => {
    return {
      stageScalar: stageScalar ? Number(stageScalar) / 10 ** 18 : 1,
      lMin: lMin ? Number(lMin) / 10 ** 18 : 1,
      lMax: lMax ? Number(lMax) / 10 ** 18 : 1.5,
    };
  }, [stageScalar, lMin, lMax]);
}

// Hook to calculate estimated rewards for a user in a team
export function useEstimatedRewards(teamId: number) {
  const { data: economy, refetch } = useTeamEconomy(teamId);
  const { address } = useAccount();

  return useMemo(() => {
    if (!economy || !address) return null;

    // Calculate potential rewards if team WEDO was withdrawn now
    const potentialIdoFromTeam = economy.teamWedoBalance * economy.teamLeverage;

    // User's share would depend on the current sharing mechanism
    // For now, assume equal distribution among active members
    // This is a simplified calculation - actual sharing may be more complex
    const estimatedShare = potentialIdoFromTeam; // Will need team size to calculate proper share

    return {
      currentClaimable: economy.userPendingIdo + economy.userAccrued,
      potentialFromTeamPool: estimatedShare,
      totalPotential:
        economy.userPendingIdo + economy.userAccrued + estimatedShare,
    };
  }, [economy, address]);
}
