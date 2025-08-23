import {
  teamEconomyConfig,
  teamManagerConfig,
} from "@/lib/contracts/generated";
import { getAllTeamMembers, getTeamLeaderboardIDO } from "@/lib/data";
import {
  activityStreamKey,
  redisClient,
  teamMemberKey,
  userLeaderboardIDOKey,
} from "@/lib/redis";
import type { Activity } from "@/lib/typings";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { handle } from "hono/vercel";
import { decode } from "next-auth/jwt";
import * as R from "ramda";
import {
  createPublicClient,
  createWalletClient,
  getContract,
  http,
  parseEther,
  parseEventLogs,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { multicall, readContract } from "viem/actions";
import { sepolia } from "viem/chains";
import { z } from "zod";

const zeroxSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]+$/)
  .transform((val) => {
    return val as `0x${string}`;
  });

const chainConfig = {
  chain: sepolia,
  transport: http(process.env.RPC_URL_SEPOLIA),
};

const publicClient = createPublicClient(chainConfig);

const adminClient = createWalletClient({
  ...chainConfig,
  account: privateKeyToAccount(
    zeroxSchema.parse(process.env.ADMIN_PRIVATE_KEY)
  ),
});

const teamManager = getContract({
  ...teamManagerConfig,
  client: publicClient,
});
const teamEconomy = getContract({
  ...teamEconomyConfig,
  client: adminClient,
});

const jwt = createMiddleware<{
  Variables: {
    address?: `0x${string}`;
  };
}>(async (c, next) => {
  const token = await decode({
    token: getCookie(c, "next-auth.session-token"),
    secret: process.env.NEXTAUTH_SECRET!,
  });

  c.set("address", token?.address as `0x${string}`);
  await next();
});

const testRouter = new Hono()
  .get("/redis/set", async (c) => {
    const v = c.req.queries("v");
    const res = await redisClient.incr("test");
    return c.json({ message: "redis-set", res });
  })
  .get("/redis/get", async (c) => {
    const res = await redisClient.get("test");
    return c.json({ message: "redis-get", res });
  });

const app = new Hono()
  .basePath("api")
  .use(jwt)
  .route("/test", testRouter)
  .get("/hello", async (c) => {
    const address = c.var.address;
    const results = await multicall(publicClient, {
      contracts: [
        {
          ...teamEconomyConfig,
          functionName: "getTeamL",
          args: [BigInt(1)],
        },
        {
          ...teamEconomyConfig,
          functionName: "getR",
          args: [BigInt(1)],
        },
        {
          ...teamManagerConfig,
          functionName: "getTeamSize",
          args: [BigInt(1)],
        },
        {
          ...teamEconomyConfig,
          functionName: "getStageScalar",
        },
      ],
    });

    console.log({ results });

    return c.json({ message: "hello", address });
  })
  .get("/teams", async (c) => {
    // 获取团队排行榜（包含总分和成员信息）
    const leaderboard = await getTeamLeaderboardIDO();
    const allTeamMembers = await getAllTeamMembers();
    console.log({ allTeamMembers, leaderboard });

    // 使用 multicall 批量获取团队 WEDO 余额
    const teamWedoBalances = await multicall(publicClient, {
      contracts: leaderboard.map((team) => ({
        ...teamEconomyConfig,
        functionName: "teamWedoBalance",
        args: [BigInt(team.teamId)],
      })),
    });

    console.log({ teamWedoBalances });

    // 使用 multicall 批量获取团队杠杆（L值）
    const teamLeverages = await multicall(publicClient, {
      contracts: leaderboard.map((team) => ({
        ...teamEconomyConfig,
        functionName: "getTeamL",
        args: [BigInt(team.teamId)],
      })),
    });

    // 使用 multicall 批量获取团队元数据
    const teamMetadatas = await multicall(publicClient, {
      contracts: leaderboard.map((team) => ({
        ...teamManagerConfig,
        functionName: "teams",
        args: [BigInt(team.teamId)],
      })),
    });

    // 组装返回数据
    const rankedTeams = leaderboard.map((team, idx) => {
      // 获取对应的 WEDO 余额和杠杆
      const wedoBalanceResult = teamWedoBalances[idx];
      const leverageResult = teamLeverages[idx];
      const metadataResult = teamMetadatas[idx];

      // 处理 multicall 返回值
      const wedoBalance =
        wedoBalanceResult.status === "success" ? wedoBalanceResult.result : 0;
      const leverageRaw =
        leverageResult.status === "success"
          ? BigInt(leverageResult.result)
          : BigInt(0);
      const leverage = String(leverageRaw);

      console.log({ wedoBalance, leverage, metadataResult });

      // 处理团队元数据
      const teamMetadata: [string, bigint] =
        metadataResult.status === "success"
          ? (metadataResult.result as unknown as [string, bigint])
          : ["", BigInt(0)];

      const members = team.members.map((member) => {
        const memberInfo = allTeamMembers.find(
          (m) => m.address === member.address
        );
        return {
          ...member,
          status: memberInfo?.status ?? "active",
        };
      });

      return {
        id: team.teamId,
        name: teamMetadata[0] as string,
        remainingMembers: Number(teamMetadata[1]),
        members,
        totalScore: team.score,
        totalMembers: 6, // TODO: 可根据实际情况调整
        isUserTeam: false,
        rank: idx + 1,
        leverage,
        scoreHistory: [1, 2, 3],
        dividendVault: {
          totalBalance: String(wedoBalance), // 这里填充真实的 WEDO 余额
          userClaimable: 0,
          totalDistributed: 12340.5,
        },
        flag: "🔥",
        previousRank: 9,
      };
    });

    return c.json(rankedTeams);
  })
  .post(
    "/credit",
    zValidator(
      "json",
      z.object({
        amount: z.number(),
        account: zeroxSchema,
      })
    ),
    async (c) => {
      const { amount: idoAmount, account } = c.req.valid("json");

      console.log("收到请求 /credit，参数：", { idoAmount, account });

      try {
        const teamId = await teamManager.read.accountTeam([account]);
        console.log("查询到 teamId：", teamId);

        const dividendRate = 20;
        const wedoAmount = idoAmount / dividendRate;

        console.log("计算 wedoAmount：", wedoAmount);

        const idoTx = await teamEconomy.write.creditPersonalIDO([
          account,
          parseEther(idoAmount.toString()),
        ]);
        console.log("已发送 creditPersonalIDO 交易，hash：", idoTx);

        await redisClient.zadd(
          userLeaderboardIDOKey,
          { incr: true },
          {
            score: idoAmount,
            member: account,
          }
        );

        const wedoTx = await teamEconomy.write.creditTeamWEDO([
          teamId,
          parseEther(wedoAmount.toString()),
        ]);
        console.log("已发送 creditTeamWEDO 交易，hash：", wedoTx);

        // 记录活动到活动流
        const activity: Activity = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user: account,
          teamId: Number(teamId),
          action: `获得学习积分`,
          wedoAmount,
          idoAmount,
          timestamp: Date.now(),
          txHash: idoTx,
        };

        // 存储到不同的活动流中
        await redisClient.lpush(
          activityStreamKey(Number(teamId), account),
          JSON.stringify(activity)
        );

        return c.json({
          message: "credited",
          wedoAmount,
          idoAmount,
          account,
          idoTx,
          wedoTx,
        });
      } catch (error) {
        console.error("处理 /credit 时发生错误：", error);
        return c.json(
          {
            message: "error",
          },
          500
        );
      }
    }
  )
  .post(
    "/members/events",
    zValidator("json", z.object({ txHash: zeroxSchema })),
    async (c) => {
      const { txHash } = c.req.valid("json");

      console.log("收到 /members/events 请求，参数：", { txHash });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log("交易回执：", receipt);
      if (receipt.status !== "success") {
        console.warn("交易回执状态非 success：", receipt.status);
        return c.json({ message: "tx reverted" }, 400);
      }
      const logs = parseEventLogs({
        logs: receipt.logs,
        abi: teamManagerConfig.abi,
      });
      console.log("解析到的事件日志：", logs);
      let persisted = 0;
      for (const log of logs) {
        if (log.eventName === "MemberJoined") {
          const { teamId, account } = log.args;
          // 可选：仅允许当前登录地址的事件（提升数据可信度）
          // const caller = c.var.address?.toLowerCase();
          // if (caller && caller !== account.toLowerCase()) continue;
          const key = teamMemberKey(Number(teamId), account);
          console.log(
            `检测到 MemberJoined 事件，teamId: ${teamId}, account: ${account}, redis key: ${key}`
          );
          await redisClient.set(key, "active");

          persisted++;
        } else if (log.eventName === "MemberLeft") {
          const { teamId, account } = log.args;
          const key = teamMemberKey(Number(teamId), account);
          console.log(
            `检测到 MemberLeft 事件，teamId: ${teamId}, account: ${account}, redis key: ${key}`
          );
          await redisClient.del(key);
        }
      }
      console.log("处理完成，返回响应");
      return c.json({ message: "processed", persisted });
    }
  )
  .post(
    "/claim/track",
    zValidator(
      "json",
      z.object({
        txHash: zeroxSchema,
        teamId: z.number(),
        account: zeroxSchema,
      })
    ),
    async (c) => {
      const { txHash, teamId, account } = c.req.valid("json");

      console.log("收到 /claim/track 请求，参数：", {
        txHash,
        teamId,
        account,
      });

      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });
        console.log("Claim交易回执：", receipt);

        if (receipt.status !== "success") {
          console.warn("Claim交易回执状态非 success：", receipt.status);
          return c.json({ message: "tx reverted" }, 400);
        }

        const logs = parseEventLogs({
          logs: receipt.logs,
          abi: teamEconomyConfig.abi,
        });
        console.log("解析到的Claim事件日志：", logs);

        let claimedAmount = 0;
        for (const log of logs) {
          if (log.eventName === "Claimed") {
            const {
              teamId: eventTeamId,
              account: eventAccount,
              amount,
            } = log.args;

            // 验证事件是否匹配请求参数
            if (
              Number(eventTeamId) === teamId &&
              eventAccount.toLowerCase() === account.toLowerCase()
            ) {
              claimedAmount = Number(amount) / 10 ** 18; // 转换为以太单位
              console.log(
                `检测到 Claimed 事件，teamId: ${teamId}, account: ${account}, amount: ${claimedAmount}`
              );

              // 记录活动到活动流
              const activity: Activity = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                user: account,
                teamId: teamId,
                action: "领取奖励",
                wedoAmount: 0,
                idoAmount: claimedAmount,
                timestamp: Date.now(),
                txHash: txHash,
              };

              // 存储到活动流中
              await redisClient.lpush(
                activityStreamKey(teamId, account),
                JSON.stringify(activity)
              );

              console.log(`已记录Claim活动到Redis，金额: ${claimedAmount} IDO`);
              break;
            }
          }
        }

        if (claimedAmount === 0) {
          console.warn("未找到匹配的Claimed事件");
          return c.json({ message: "no matching claim event found" }, 400);
        }

        return c.json({
          message: "claim tracked successfully",
          claimedAmount,
          txHash,
          teamId,
          account,
        });
      } catch (error) {
        console.error("处理 /claim/track 时发生错误：", error);
        return c.json(
          {
            message: "error tracking claim",
            error: error instanceof Error ? error.message : String(error),
          },
          500
        );
      }
    }
  )
  .post(
    "/withdraw/track",
    zValidator(
      "json",
      z.object({
        txHash: zeroxSchema,
        teamId: z.number(),
        account: zeroxSchema,
      })
    ),
    async (c) => {
      const { txHash, teamId, account } = c.req.valid("json");

      console.log("收到 /withdraw/track 请求，参数：", {
        txHash,
        teamId,
        account,
      });

      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });
        console.log("Withdraw交易回执：", receipt);

        if (receipt.status !== "success") {
          console.warn("Withdraw交易回执状态非 success：", receipt.status);
          return c.json({ message: "tx reverted" }, 400);
        }

        const logs = parseEventLogs({
          logs: receipt.logs,
          abi: teamEconomyConfig.abi,
        });
        console.log("解析到的Withdraw事件日志：", logs);

        let withdrawnWedoAmount = 0;
        let mintedIdoAmount = 0;
        let leverageRatio = 0;

        for (const log of logs) {
          if (log.eventName === "TeamWithdraw") {
            const {
              teamId: eventTeamId,
              caller,
              amountWEDO,
              L,
              mintIdo,
              R,
            } = log.args;

            // 验证事件是否匹配请求参数
            if (
              Number(eventTeamId) === teamId &&
              caller.toLowerCase() === account.toLowerCase()
            ) {
              withdrawnWedoAmount = Number(amountWEDO) / 10 ** 18;
              mintedIdoAmount = Number(mintIdo) / 10 ** 18;
              leverageRatio = Number(L) / 10 ** 18;

              console.log(
                `检测到 TeamWithdraw 事件，teamId: ${teamId}, caller: ${account}, withdrawnWEDO: ${withdrawnWedoAmount}, mintedIDO: ${mintedIdoAmount}, L: ${leverageRatio}`
              );

              // 记录活动到活动流
              const activity: Activity = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                user: account,
                teamId: teamId,
                action: "转换团队WEDO",
                wedoAmount: -withdrawnWedoAmount, // 负数表示转出
                idoAmount: 0,
                timestamp: Date.now(),
                txHash: txHash,
              };

              // 存储到活动流中
              await redisClient.lpush(
                activityStreamKey(teamId, account),
                JSON.stringify(activity)
              );

              console.log(
                `已记录Withdraw活动到Redis，转换 ${withdrawnWedoAmount} WEDO -> ${mintedIdoAmount} IDO`
              );
              break;
            }
          }
        }

        if (withdrawnWedoAmount === 0) {
          console.warn("未找到匹配的TeamWithdraw事件");
          return c.json({ message: "no matching withdraw event found" }, 400);
        }

        return c.json({
          message: "withdraw tracked successfully",
          withdrawnWedoAmount,
          mintedIdoAmount,
          leverageRatio,
          txHash,
          teamId,
          account,
        });
      } catch (error) {
        console.error("处理 /withdraw/track 时发生错误：", error);
        return c.json(
          {
            message: "error tracking withdraw",
            error: error instanceof Error ? error.message : String(error),
          },
          500
        );
      }
    }
  )
  .get("/leaderboard/ido/user", async (c) => {
    const flatRank = await redisClient.zrange(userLeaderboardIDOKey, 0, -1, {
      withScores: true,
    });
    // @ts-ignore
    const createMemberScores = R.pipe(
      R.splitEvery(2),
      // @ts-ignore
      R.map(R.zipObj(["address", "score"]))
    );
    // @ts-ignore
    const sortedUsers: { address: `0x${string}`; score: number }[] =
      createMemberScores(flatRank);
    return c.json(sortedUsers);
  })
  .get("/leaderboard/ido/team", async (c) => {
    const teamLeaderboard = await getTeamLeaderboardIDO();
    return c.json(teamLeaderboard);
  })
  .get(
    "/teams/:teamId/activities",
    zValidator("param", z.object({ teamId: z.coerce.number() })),
    async (c) => {
      const { teamId } = c.req.valid("param");

      console.log(`[活动查询] 开始获取 teamId: ${teamId} 的活动数据`);

      // 使用 pipeline 批量获取所有匹配 key 的活动数据
      const keyPattern = activityStreamKey(teamId, "*");
      const keys = await redisClient.keys(keyPattern);

      let activities: Activity[] = [];
      if (keys.length > 0) {
        const pipeline = redisClient.pipeline();
        for (const key of keys) {
          console.log(`[活动查询] 获取 key: ${key}`);
          pipeline.lrange(key, 0, -1);
        }
        const results = await pipeline.exec<unknown[][]>();
        // results 是一个二维数组，需扁平化
        activities = results.flatMap((r) =>
          r.map((x) => {
            console.log(x);
            const activity = x as Activity;
            return activity;
          })
        );
      }

      console.log(
        `[活动查询] key: ${keyPattern} 获取到 ${activities.length} 条原始数据`
      );

      return c.json(activities);
    }
  );
export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof app;
