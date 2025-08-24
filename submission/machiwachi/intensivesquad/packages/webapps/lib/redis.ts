import { Redis } from "@upstash/redis";

// Initialize Redis
export const redisClient = Redis.fromEnv();

/**
 * 存团队当前用户状态
 * @param teamId - The ID of the team
 * @param memberAddress - The address of the member
 * @returns The key of the team member
 */
export const teamMemberKey = (teamId: number | "*", memberAddress: string) =>
  `team:${teamId}:member:${memberAddress}` as const;
export const getTeamMemberAddress = (key: string) =>
  key.split(":")[3] as `0x${string}`;
export const teamKey = (teamId: number) => `team:${teamId}`;
// export const userTxsKey = (address: string) => `user:${address}:txs`;
// export const userIDOKey = (address: string) => `user:${address}:ido`;

export const userLeaderboardIDOKey = `leaderboard:ido:user`;
export const userIDOKey = (address: string) => `user:${address}:ido`;

// 活动追踪相关 keys
export const activityStreamKey = (
  teamId: number | "*",
  address: `0x${string}` | "*"
) => `activities:team:${teamId}:user:${address}`;
