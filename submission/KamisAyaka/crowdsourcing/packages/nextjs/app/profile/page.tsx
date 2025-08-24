"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const ProfilePage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [isRegistered, setIsRegistered] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [skills, setSkills] = useState("");

  const { data: userProfile } = useScaffoldReadContract({
    contractName: "UserInfo",
    functionName: "getUserProfile",
    args: [connectedAddress],
  });

  const { data: userSkills } = useScaffoldReadContract({
    contractName: "UserInfo",
    functionName: "getUserSkills",
    args: [connectedAddress],
  });

  const { data: isUserRegistered } = useScaffoldReadContract({
    contractName: "UserInfo",
    functionName: "isUserRegistered",
    args: [connectedAddress],
  });

  const { writeContractAsync: registerUser } = useScaffoldWriteContract({ contractName: "UserInfo" });
  const { writeContractAsync: updateUserProfile } = useScaffoldWriteContract({ contractName: "UserInfo" });
  const { writeContractAsync: updateUserSkills } = useScaffoldWriteContract({ contractName: "UserInfo" });

  useEffect(() => {
    if (isUserRegistered !== undefined) {
      setIsRegistered(isUserRegistered);
    }
    if (userProfile && userProfile.exists) {
      setName(userProfile.name);
      setEmail(userProfile.email);
      setBio(userProfile.bio);
      setWebsite(userProfile.website);
    }
    if (userSkills) {
      setSkills(userSkills.join(", "));
    }
  }, [userProfile, userSkills, isUserRegistered]);

  const handleRegister = async () => {
    if (!name.trim()) {
      notification.error("姓名不能为空");
      return;
    }

    const skillsArray = skills
      .split(",")
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    try {
      registerUser({
        functionName: "registerUser",
        args: [name, email, bio, website, skillsArray],
      });
      setIsRegistered(true);
    } catch (error) {
      console.error("注册失败:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      notification.error("姓名不能为空");
      return;
    }

    try {
      updateUserProfile({
        functionName: "updateUserProfile",
        args: [name, email, bio, website],
      });
    } catch (error) {
      console.error("更新个人信息失败:", error);
    }
  };

  const handleUpdateSkills = async () => {
    const skillsArray = skills
      .split(",")
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    try {
      await updateUserSkills({
        functionName: "updateUserSkills",
        args: [skillsArray],
      });
    } catch (error) {
      console.error("更新技能失败:", error);
    }
  };

  const handleSubmit = async () => {
    if (isRegistered) {
      await handleUpdateProfile();
      await handleUpdateSkills();
    } else {
      await handleRegister();
    }
  };

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 px-6 py-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-6">用户信息</h2>
          <div className="text-center">
            <p className="mb-4">请先连接钱包以查看和编辑您的个人信息</p>
            <Address address={connectedAddress} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 px-6 py-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isRegistered ? "用户信息" : "用户注册"}</h2>
          {isRegistered && (
            <Link href={`/user/${connectedAddress}`} className="btn btn-secondary btn-sm">
              查看公开资料
            </Link>
          )}
        </div>

        <div className="space-y-4" style={{ marginTop: "2rem" }}>
          <div>
            <label className="block text-sm font-medium mb-1">姓名 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="请输入您的姓名"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="请输入您的邮箱地址"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">个人简介</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="请简单介绍一下自己"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">网站</label>
            <input
              type="text"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="请输入您的个人网站或作品集链接"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 将更新信息按钮移到技能区域上方 */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full"
            >
              {isRegistered ? "更新信息" : "注册"}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">技能</label>
            <textarea
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="请输入您的技能，用逗号分隔（例如：JavaScript, React, Solidity）"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">请输入技能并用逗号分隔，例如：JavaScript, React, Solidity</p>
              {isRegistered && (
                <button onClick={handleUpdateSkills} className="btn btn-sm btn-secondary">
                  更新技能
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
