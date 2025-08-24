"use client";

import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

/**
 * 管理员信息面板组件
 */
export const AdminPanel = () => {
  const { address: connectedAddress } = useAccount();

  // 获取管理员状态
  const { data: adminStatus } = useScaffoldReadContract({
    contractName: "DisputeResolver",
    functionName: "adminStatus",
    args: [connectedAddress],
  });

  // 获取管理员质押金额
  const { data: adminStake } = useScaffoldReadContract({
    contractName: "DisputeResolver",
    functionName: "adminStakes",
    args: [connectedAddress],
  });

  // 获取所需质押金额
  const { data: requiredStake } = useScaffoldReadContract({
    contractName: "DisputeResolver",
    functionName: "adminStakeAmount",
  });

  const isAdmin = adminStatus ? Number(adminStatus) === 1 : false; // 1 = Active
  const hasStake = adminStake && adminStake > 0n;

  return (
    <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">管理员信息</h2>

      {connectedAddress ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-base-200 p-4 rounded-xl">
            <p className="text-sm text-gray-500">您的地址</p>
            <Address address={connectedAddress} />
          </div>
          <div className="bg-base-200 p-4 rounded-xl">
            <p className="text-sm text-gray-500">管理员状态</p>
            <p className={`font-bold ${isAdmin ? "text-green-500" : "text-red-500"}`}>
              {isAdmin ? "已激活" : hasStake ? "已质押(未激活)" : "未质押"}
            </p>
          </div>
          <div className="bg-base-200 p-4 rounded-xl">
            <p className="text-sm text-gray-500">质押金额</p>
            <p className="font-bold">
              {adminStake ? (Number(adminStake) / 1e18).toFixed(2) : "0"} /
              {requiredStake ? (Number(requiredStake) / 1e18).toFixed(2) : "0"} TST
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500">请连接钱包以查看管理员信息</p>
        </div>
      )}
    </div>
  );
};
