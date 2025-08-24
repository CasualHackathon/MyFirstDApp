'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { parseEther, type Address } from 'viem';
import {
  ASSET3D_NFT_ABI,
  CONTRACT_ADDRESSES,
  type Asset3DMetadata,
} from '@/shared/contracts/asset3dnft';
import { createAndUploadNFTMetadata } from '@/shared/ipfs/client';
import { TaskStatusResponse } from '@/shared/meshy/types';
import { toast } from 'sonner';

export interface MintNFTParams {
  name: string;
  description: string;
  taskResult: TaskStatusResponse;
  royaltyBps?: number; // 版税基点 (例如: 500 = 5%)
}

export function useNFTMint() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  // 防止重复提交（快速双击或渲染抖动导致的重复请求）
  const isMintingRef = useRef(false);

  const { address, chainId } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isTransactionSuccess,
    error: transactionError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // 重置状态函数
  const resetState = () => {
    setIsLoading(false);
    setCurrentStep('');
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  // 监听交易状态变化
  useEffect(() => {
    if (hash && isPending) {
      setCurrentStep('Transaction submitted, awaiting confirmation...');

      // 设置超时保护 (5分钟)
      const timeout = setTimeout(
        () => {
          if (isLoading) {
            resetState();
            toast.error('Transaction timeout', {
              description:
                'If the transaction was submitted, check its status on Etherscan',
            });
          }
        },
        5 * 60 * 1000
      );

      setTimeoutId(timeout);
    }
  }, [hash, isPending, isLoading]);

  useEffect(() => {
    if (hash && isConfirming) {
      setCurrentStep('Transaction confirming, please wait...');
    }
  }, [hash, isConfirming]);

  // 处理交易成功
  useEffect(() => {
    if (isTransactionSuccess && isLoading) {
      resetState();
      isMintingRef.current = false;
      toast.success('NFT minted successfully!', {
        description: 'Your 3D NFT has been minted on-chain',
      });
    }
  }, [isTransactionSuccess, isLoading]);

  // 处理交易错误
  useEffect(() => {
    if (error && isLoading) {
      console.error('Contract write error:', error);
      resetState();
      isMintingRef.current = false;

      let errorMessage = 'Transaction failed';
      if (error.message.includes('User rejected')) {
        errorMessage = 'User rejected the transaction';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas';
      } else if (error.message.includes('nonce')) {
        errorMessage = 'Nonce error, please retry';
      } else {
        errorMessage = `Transaction failed: ${error.message}`;
      }

      toast.error(errorMessage);
    }
  }, [error, isLoading]);

  // 处理交易确认错误
  useEffect(() => {
    if (transactionError && isLoading) {
      console.error('Transaction confirmation error:', transactionError);
      resetState();
      isMintingRef.current = false;
      toast.error(
        `Transaction confirmation failed: ${transactionError.message}`
      );
    }
  }, [transactionError, isLoading]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const mintNFT = async ({
    name,
    description,
    taskResult,
    royaltyBps = 250,
  }: MintNFTParams) => {
    // 并发保护：若正在铸造，直接忽略后续点击
    if (isMintingRef.current || isLoading) return;
    isMintingRef.current = true;

    if (!address) {
      toast.error('Please connect your wallet first');
      isMintingRef.current = false;
      return;
    }

    // 若未连接到受支持的网络，直接提示并终止（避免弹出切网确认框）
    if (chainId !== sepolia.id) {
      isMintingRef.current = false;
      toast.error('Please switch to Sepolia in MetaMask, then click Mint');
      return;
    }

    setIsLoading(true);
    setCurrentStep('Preparing metadata...');

    try {
      // 1. 上传元数据到 IPFS
      setCurrentStep('Uploading metadata to IPFS...');
      const metadataResult = await createAndUploadNFTMetadata(
        name,
        description,
        taskResult.thumbnail_url || taskResult.video_url || '',
        {
          taskId: taskResult.id,
          modelUrl:
            taskResult.model_urls?.glb || taskResult.model_urls?.obj || '',
          thumbnailUrl: taskResult.thumbnail_url,
          videoUrl: taskResult.video_url,
          textureUrls:
            taskResult.texture_urls
              ?.map((tex) => tex.base_color || '')
              .filter(Boolean) || [],
          artStyle: taskResult.art_style || 'realistic',
          mode: taskResult.mode as 'preview' | 'refine',
          polycount: taskResult.polycount,
        }
      );

      toast.success('Metadata uploaded successfully!');

      // 2. 准备合约参数
      setCurrentStep('Preparing mint params...');
      const contractAddress = CONTRACT_ADDRESSES[sepolia.id]
        .ASSET3D_NFT as Address;

      const metadata: Asset3DMetadata = {
        name,
        description,
        meshyTaskId: taskResult.id,
        modelUrl:
          taskResult.model_urls?.glb || taskResult.model_urls?.obj || '',
        thumbnailUrl: taskResult.thumbnail_url || '',
        videoUrl: taskResult.video_url || '',
        textureUrls: (taskResult.texture_urls
          ?.map((tex) => tex.base_color || '')
          .filter(Boolean) || []) as readonly string[],
        artStyle: taskResult.art_style || 'realistic',
        mode: taskResult.mode === 'refine' ? 1 : 0,
        hasTexture: (taskResult.texture_urls?.length || 0) > 0,
        polycount: BigInt(taskResult.polycount || 0),
        creator: address,
        royaltyBps: BigInt(royaltyBps),
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
      };

      // 3. 调用合约铸造
      setCurrentStep('Sending transaction to blockchain...');
      console.log('Calling writeContract with:', {
        contractAddress,
        metadata,
        address,
      });

      // Help viem's complex generic inference by narrowing args
      const args = [address as Address, metadata] as const;
      writeContract({
        address: contractAddress,
        abi: ASSET3D_NFT_ABI,
        functionName: 'mint',
        // Cast to any to avoid 'never' intersection in viem prepared mode typings
        args: args as any,
      });
    } catch (error) {
      console.error('Error minting NFT:', error);
      setIsLoading(false);
      setCurrentStep('');
      isMintingRef.current = false;

      let errorMessage = 'Mint failed';
      if (error instanceof Error) {
        if (error.message.includes('Failed to create NFT metadata')) {
          errorMessage = 'Failed to create metadata, check IPFS config';
        } else {
          errorMessage = `Mint failed: ${error.message}`;
        }
      }

      toast.error(errorMessage);
    }
  };

  return {
    mintNFT,
    resetState, // 暴露重置函数，允许手动重置
    isLoading: isLoading || isPending || isConfirming,
    currentStep:
      currentStep ||
      (isPending
        ? 'Waiting for wallet confirmation...'
        : isConfirming
          ? 'Transaction confirming...'
          : ''),
    hash,
    isSuccess: isTransactionSuccess,
    error: error || transactionError,
  };
}
