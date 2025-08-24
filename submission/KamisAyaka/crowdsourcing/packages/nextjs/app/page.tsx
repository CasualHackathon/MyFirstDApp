"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, UserIcon, WalletIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">欢迎使用</span>
            <span className="block text-4xl font-bold">任务众包平台</span>
          </h1>

          <div className="flex justify-center items-center space-x-2 flex-col mb-8">
            <p className="my-2 font-medium">已连接地址:</p>
            <Address address={connectedAddress} />
          </div>

          <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 px-6 py-4 mb-8">
            <h2 className="text-2xl font-bold text-center mb-4">平台介绍</h2>
            <p className="text-left mb-6">
              {"\u00A0\u00A0"}这是一个基于区块链的去中心化任务众包平台，支持多种任务类型和支付方式。
              通过智能合约确保交易的安全性和透明性。平台具有去中心化架构，无需第三方中介，降低交易成本，
              同时支持多种任务类型以满足不同场景需求。智能合约自动执行保障了交易安全，
              内置的纠纷解决机制保障了双方权益，平台支持代币支付，方便快捷，
              所有操作记录在区块链上，确保交易记录的透明性。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/bidding" className="bg-base-200 p-6 rounded-xl hover:bg-base-300 transition-colors">
                <h3 className="font-bold text-lg mb-2">竞标任务</h3>
                <p className="text-sm">
                  任务创建者发布任务，工作者可以提交竞标，创建者选择最优报价。这种模式适用于任务需求明确但实现方式可能多样的场景，创建者可以通过竞标了解市场行情并选择最合适的工作者。
                </p>
              </Link>
              <Link href="/fixed-payment" className="bg-base-200 p-6 rounded-xl hover:bg-base-300 transition-colors">
                <h3 className="font-bold text-lg mb-2">固定薪酬任务</h3>
                <p className="text-sm">
                  任务创建者直接指定工作者和固定报酬，任务完成后一次性支付。这种模式适用于创建者已经确定工作者或者有固定预算的场景，流程简单直接，适合紧急或明确的任务需求。
                </p>
              </Link>
              <Link href="/milestone" className="bg-base-200 p-6 rounded-xl hover:bg-base-300 transition-colors">
                <h3 className="font-bold text-lg mb-2">里程碑任务</h3>
                <p className="text-sm">
                  任务可以分为多个阶段，每个阶段完成后支付相应报酬。这种模式适用于大型或复杂的项目，通过分阶段付款降低风险，确保项目按计划推进，同时保障工作者能够获得阶段性的报酬。
                </p>
              </Link>
            </div>
          </div>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl h-full">
              <UserIcon className="h-8 w-8 fill-secondary" />
              <p>
                使用{" "}
                <Link href="/profile" passHref className="link">
                  用户资料
                </Link>{" "}
                页面管理您的个人信息。您可以在此设置个人资料、技能和联系方式，
                让其他用户更好地了解您，提升在平台上的可信度和专业形象。
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl h-full">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                使用{" "}
                <Link href="/debug" passHref className="link">
                  调试合约
                </Link>{" "}
                页面与智能合约进行交互。开发者可以在此直接读取和写入合约数据，
                方便测试和调试各种功能，确保合约按预期工作。
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl h-full">
              <WalletIcon className="h-8 w-8 fill-secondary" />
              <p>
                使用{" "}
                <Link href="/dispute" passHref className="link">
                  纠纷解决
                </Link>{" "}
                页面处理任务纠纷。当任务创建者与工作者之间产生争议时，
                可以提交纠纷并由管理员投票决定资金分配方案，确保交易的公平性。
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
