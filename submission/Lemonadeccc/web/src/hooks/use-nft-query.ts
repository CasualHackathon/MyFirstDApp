'use client';

import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import {
  ASSET3D_NFT_ABI,
  CONTRACT_ADDRESSES,
  type Asset3DMetadata,
} from '@/shared/contracts/asset3dnft';
import { useMemo } from 'react';

export interface NFTToken {
  tokenId: number;
  metadata: Asset3DMetadata;
  tokenURI: string;
  owner: string;
}

export function useNFTQuery() {
  const { address, chainId } = useAccount();

  // 获取合约地址
  const contractAddress = useMemo(() => {
    if (
      !chainId ||
      !CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
    ) {
      return null;
    }
    return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
      .ASSET3D_NFT;
  }, [chainId]);

  // 获取用户的NFT token IDs
  const { data: userTokenIds, isLoading: isLoadingTokenIds } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: ASSET3D_NFT_ABI,
    functionName: 'getAssetsByCreator',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  // 获取用户NFT余额
  const { data: balance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: ASSET3D_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  // 获取总供应量
  const { data: totalSupply } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: ASSET3D_NFT_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!contractAddress,
    },
  });

  // 批量获取NFT详细信息
  const nftContracts = useMemo(() => {
    if (!userTokenIds || !contractAddress) return [];

    return (userTokenIds as bigint[]).flatMap((tokenId) => [
      {
        address: contractAddress as `0x${string}`,
        abi: ASSET3D_NFT_ABI,
        functionName: 'getAssetMetadata',
        args: [tokenId],
      },
      {
        address: contractAddress as `0x${string}`,
        abi: ASSET3D_NFT_ABI,
        functionName: 'tokenURI',
        args: [tokenId],
      },
      {
        address: contractAddress as `0x${string}`,
        abi: ASSET3D_NFT_ABI,
        functionName: 'ownerOf',
        args: [tokenId],
      },
    ]);
  }, [userTokenIds, contractAddress]);

  const { data: nftDetails, isLoading: isLoadingDetails } = useReadContracts({
    contracts: nftContracts,
    query: {
      enabled: nftContracts.length > 0,
    },
  });

  // 处理NFT数据
  const userNFTs = useMemo((): NFTToken[] => {
    if (!userTokenIds || !nftDetails) return [];

    const tokenIds = userTokenIds as bigint[];
    const nfts: NFTToken[] = [];

    for (let i = 0; i < tokenIds.length; i++) {
      const metadataIndex = i * 3;
      const tokenURIIndex = i * 3 + 1;
      const ownerIndex = i * 3 + 2;

      const metadata = nftDetails[metadataIndex]
        ?.result as unknown as Asset3DMetadata;
      const tokenURI = nftDetails[tokenURIIndex]?.result as string;
      const owner = nftDetails[ownerIndex]?.result as string;

      if (metadata && tokenURI && owner) {
        nfts.push({
          tokenId: Number(tokenIds[i]),
          metadata,
          tokenURI,
          owner,
        });
      }
    }

    return nfts;
  }, [userTokenIds, nftDetails]);

  return {
    userNFTs,
    balance: balance ? Number(balance) : 0,
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    isLoading: isLoadingTokenIds || isLoadingDetails,
    contractAddress,
  };
}
