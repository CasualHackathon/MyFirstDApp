import { apiClient, type InferResponseType } from "@/lib/api";
import { SCORE_TOKEN } from "@/lib/data";

export type User = {
  address: `0x${string}`;
};
export type Clan = InferResponseType<typeof apiClient.teams.$get>[number];

export type TokenType = {
  symbol: string;
  decimals: number;
};

export interface Team {
  id: number;
  name: string;
  flag: string;
  rank: number;
  previousRank: number;
  totalScore: number;
  remainingMembers: number;
  totalMembers: number;
  leverage: bigint;
  isUserTeam: boolean;
  dividendVault: {
    totalBalance: bigint;
    userClaimable: number;
    totalDistributed: number;
  };
  members: TeamMember[];
  scoreHistory: number[];
}

export interface TeamMember {
  address: `0x${string}`;
  status: "active" | "eliminated" | "cooldown";
}

export type Activity = {
  id: string;
  user: `0x${string}`;
  teamId: number;
  action: string;
  idoAmount: number;
  wedoAmount: number;
  txHash?: string;
  timestamp: number;
};
