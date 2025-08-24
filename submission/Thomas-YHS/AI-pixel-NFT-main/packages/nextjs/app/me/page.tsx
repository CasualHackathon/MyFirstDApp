"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth";
import { NFTCard } from "~~/components/scaffold-eth/NFTCard";
import { NFTDetailModal } from "~~/components/scaffold-eth/NFTDetailModal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { NFTItem } from "~~/types/nft";

// function generateMockImage(city: string, weather: string, temp: number) {
//   const getWeatherColor = (weather: string) => {
//     if (weather.includes("晴")) return "#FFD700";
//     if (weather.includes("云")) return "#B0C4DE";
//     if (weather.includes("雨")) return "#4682B4";
//     return "#87CEEB";
//   };

//   const getWeatherEmoji = (weather: string) => {
//     if (weather.includes("晴")) return "☀️";
//     if (weather.includes("云")) return "☁️";
//     if (weather.includes("雨")) return "🌧️";
//     return "🌤️";
//   };

//   const bgColor = getWeatherColor(weather);
//   const emoji = getWeatherEmoji(weather);

//   const svg = `
//     <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
//       <defs>
//         <linearGradient id="bg-${city}" x1="0%" y1="0%" x2="0%" y2="100%">
//           <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
//           <stop offset="100%" style="stop-color:#4682B4;stop-opacity:1" />
//         </linearGradient>
//       </defs>

//       <rect width="300" height="400" fill="url(#bg-${city})"/>

//       <text x="150" y="60" text-anchor="middle" fill="white" font-size="24" font-weight="bold">${city}</text>
//       <text x="150" y="120" text-anchor="middle" fill="white" font-size="40">${emoji}</text>
//       <text x="150" y="180" text-anchor="middle" fill="white" font-size="36" font-weight="bold">${temp}°C</text>
//       <text x="150" y="220" text-anchor="middle" fill="white" font-size="18">${weather}</text>
//       <text x="150" y="350" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="12">Weather NFT</text>
//     </svg>
//   `;

//   // 使用 encodeURIComponent 而不是 btoa 来处理中文字符
//   return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
// }

// // 从IPFS读取NFT元数据
// async function fetchNFTMetadata(tokenURI: string): Promise<any> {
//   try {
//     // 将IPFS URL转换为HTTP网关URL
//     let httpUrl = tokenURI;
//     if (tokenURI.startsWith("ipfs://")) {
//       const cid = tokenURI.replace("ipfs://", "");
//       httpUrl = `https://gateway.mypinata.cloud/ipfs/${cid}`;
//     }

//     const response = await fetch(httpUrl);
//     if (!response.ok) {
//       throw new Error(`Failed to fetch metadata: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching NFT metadata:", error);
//     return null;
//   }
// }

const MyNFTs: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);

  // 读取用户拥有的tokenIds
  const {
    data: ownedTokenIds,
    refetch: refetchTokenIds,
    isLoading: isLoadingTokenIds,
  } = useScaffoldReadContract({
    contractName: "WeatherNFT",
    functionName: "getOwnedTokens",
    args: [connectedAddress],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openInNewTab = (url: string) => {
    window.open(url, "_blank");
  };

  if (!connectedAddress) {
    return (
      <>
        <MetaHeader title="我的NFT | AI Moment NFT" description="查看你拥有的天气NFT收藏" />
        <div className="flex items-center flex-col flex-grow pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🔒 请连接钱包</h1>
            <p className="text-lg text-base-content/70">连接你的钱包以查看你的天气NFT收藏</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaHeader title="我的NFT | AI Moment NFT" description="查看你拥有的天气NFT收藏" />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">🎨 我的天气NFT</h1>
            <p className="text-lg text-base-content/70">我的数字天气纪念收藏</p>
            <div className="mt-4">
              <Address address={connectedAddress} />
            </div>
            <div className="mt-4">
              <button className="btn btn-outline btn-sm" onClick={() => refetchTokenIds()} disabled={isLoadingTokenIds}>
                🔄 刷新数据
              </button>
            </div>
          </div>

          {isLoadingTokenIds ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <span className="loading loading-spinner loading-lg"></span>
                <span>正在加载你的NFT...</span>
              </div>
            </div>
          ) : ownedTokenIds?.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🌤️</div>
              <h2 className="text-2xl font-bold mb-2">还没有NFT</h2>
              <p className="text-base-content/70 mb-6">快去创建你的第一个天气NFT吧！</p>
              <button className="btn btn-primary" onClick={() => (window.location.href = "/create")}>
                立即创建
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedTokenIds?.map(nft => (
                  <NFTCard
                    key={Number(nft)}
                    tokenId={nft}
                    // onCardClick={() => setSelectedNFT(nft)}
                    // onOpenSeaClick={(tokenId: number) =>
                    //   (window.location.href = `https://opensea.io/assets/ethereum/CONTRACT_ADDRESS/${tokenId}`)
                    // }
                    formatDate={formatDate}
                  />
                ))}
              </div>

              <div className="text-center mt-8">
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-title">总计NFT</div>
                    <div className="stat-value">{/* totalSupply || 0 */}</div>
                    <div className="stat-desc">我的天气收藏</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* NFT详情模态框 */}
          {selectedNFT && (
            <NFTDetailModal
              nft={selectedNFT}
              onClose={() => setSelectedNFT(null)}
              formatDate={formatDate}
              openInNewTab={openInNewTab}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MyNFTs;
