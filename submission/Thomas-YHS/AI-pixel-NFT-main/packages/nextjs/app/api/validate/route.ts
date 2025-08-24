import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { getContract } from "viem";
import { getCurrentNetworkConfig, WEATHER_NFT_ABI } from "~~/lib/networkConfig";

// 获取当前网络配置
const networkConfig = getCurrentNetworkConfig();

// 创建公共客户端用于读取合约
const publicClient = createPublicClient({
  chain: networkConfig.chain,
  transport: http(networkConfig.rpcUrl),
});

export async function POST(request: NextRequest) {
  try {
    const { address, city, date } = await request.json();

    if (!address || !city || !date) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    console.log("🔍 API校验请求:", { address, city, date });
    console.log("🌐 使用网络:", networkConfig.chain.name, "RPC:", networkConfig.rpcUrl);

    // 调用合约
    const contract = getContract({
      address: networkConfig.contractAddress as `0x${string}`,
      abi: WEATHER_NFT_ABI,
      client: publicClient,
    });

    const hasMinted = await contract.read.hasAlreadyMinted([address, city, date]);
    console.log("合约返回结果:", hasMinted);

    const canMint = !hasMinted;
    const result = {
      canMint,
      reason: canMint ? undefined : "今日已铸造过该城市的NFT",
      address,
      city,
      date,
      hasMinted
    };

    console.log("🎯 校验结果:", result);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Validation API error:", error);
    return NextResponse.json(
      { 
        canMint: false, 
        reason: "合约校验失败", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}