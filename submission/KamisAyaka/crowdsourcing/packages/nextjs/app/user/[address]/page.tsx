"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const UserDetailPage = ({ params }: { params: Promise<{ address: string }> }) => {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const [userAddress, setUserAddress] = useState<string>("");
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(true);

  // 使用 React.use() 解包 params Promise，不在useEffect中使用
  const unwrappedParams = React.use(params);

  // 验证地址格式
  useEffect(() => {
    if (!unwrappedParams.address.match(/^0x[a-fA-F0-9]{40}$/)) {
      notification.error("无效的地址格式");
      router.push("/");
      setIsValidAddress(false);
    } else {
      setIsValidAddress(true);
      setUserAddress(unwrappedParams.address);
      setIsOwnProfile(connectedAddress?.toLowerCase() === unwrappedParams.address.toLowerCase());
    }
  }, [unwrappedParams.address, connectedAddress, router]);

  const { data: userProfile, isLoading: isProfileLoading } = useScaffoldReadContract({
    contractName: "UserInfo",
    functionName: "getUserProfile",
    args: [unwrappedParams.address],
  });

  const { data: userSkills, isLoading: isSkillsLoading } = useScaffoldReadContract({
    contractName: "UserInfo",
    functionName: "getUserSkills",
    args: [unwrappedParams.address],
  });

  const { data: isUserRegistered, isLoading: isRegisteredLoading } = useScaffoldReadContract({
    contractName: "UserInfo",
    functionName: "isUserRegistered",
    args: [unwrappedParams.address],
  });

  if (!isValidAddress) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 px-6 py-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-6">加载中...</h2>
          <div className="text-center">
            <p className="mb-4">正在重定向...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isProfileLoading || isSkillsLoading || isRegisteredLoading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 px-6 py-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-6">加载中...</h2>
          <div className="text-center">
            <p className="mb-4">正在加载用户信息...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isUserRegistered) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 px-6 py-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-6">用户未找到</h2>
          <div className="text-center">
            <p className="mb-4">该地址尚未注册用户信息</p>
            <Link href="/" className="btn btn-primary">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 px-6 py-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">用户信息</h2>
          {isOwnProfile && (
            <Link href="/profile" className="btn btn-secondary btn-sm">
              编辑资料
            </Link>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">用户地址:</span>
            <Address address={userAddress} />
          </div>
        </div>

        {userProfile && userProfile.exists && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">姓名</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-base-200">{userProfile.name}</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">邮箱</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-base-200">
                {userProfile.email || "未提供"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">个人简介</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-base-200">
                {userProfile.bio || "未提供"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">网站</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-base-200">
                {userProfile.website ? (
                  <a
                    href={
                      userProfile.website.startsWith("http") ? userProfile.website : `http://${userProfile.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    {userProfile.website}
                  </a>
                ) : (
                  "未提供"
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">技能</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-base-200">
                {userSkills && userSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userSkills.map((skill: string, index: number) => (
                      <span key={index} className="badge badge-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  "未提供技能信息"
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">注册时间</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-base-200">
                {userProfile.registeredAt ? new Date(Number(userProfile.registeredAt) * 1000).toLocaleString() : "未知"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailPage;
