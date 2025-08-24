'use client';

import { useState, useEffect, Suspense, useRef, memo } from 'react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNFTQuery } from '@/hooks/use-nft-query';
import { useAccount } from 'wagmi';
import {
  Coins,
  ExternalLink,
  Download,
  Share2,
  Palette,
  Wallet,
  Loader2,
  Package,
  ArrowRight,
  Upload,
  Sparkles,
  Box
} from 'lucide-react';
import { NFTMintDialog } from '@/components/web3/NFTMintDialog';
import { storage } from '@/shared/storage';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';

// Lightweight 3D model component for NFT cards - 让ErrorBoundary处理所有错误
const NFT3DModel = memo(function NFT3DModel({ url }: { url: string }) {
  const modelRef = useRef<any>(null);
  const gltf = useGLTF(url); // 错误会被ErrorBoundary捕获

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005; // Slow rotation
    }
  });

  if (!gltf || !gltf.scene) {
    return null;
  }

  return <primitive ref={modelRef} object={gltf.scene} scale={1} />;
});

// Error boundary component for 3D models
class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('3D Model Error Boundary caught an error:', error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <Box className="h-12 w-12 mx-auto text-gray-500 mb-2" />
            <p className="text-xs text-gray-400">Failed to load 3D model</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback for when model is loading or failed
function NFTFallbackModel() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
      <Box className="h-16 w-16 text-gray-500" />
    </div>
  );
}

function TNFTCard({ nft }: { nft: any }) {
  const [show3D, setShow3D] = useState(true);
  const [modelLoadError, setModelLoadError] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: nft.metadata.name,
        text: nft.metadata.description,
        url: window.location.href,
      });
    }
  };

  const handleDownload = () => {
    if (nft.metadata.modelUrl) {
      window.open(nft.metadata.modelUrl, '_blank');
    }
  };

  const has3DModel = nft.metadata.modelUrl && nft.metadata.modelUrl.endsWith('.glb');

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        {/* Show 3D model if available and not errored, otherwise fallback to image */}
        {has3DModel && show3D && !modelLoadError ? (
          <Suspense fallback={<NFTFallbackModel />}>
            <Canvas
              camera={{ position: [0, 0, 3], fov: 45 }}
              className="w-full h-full"
              onError={() => {
                console.error('3D model failed to load for NFT:', nft.tokenId);
                setModelLoadError(true);
                setShow3D(false);
              }}
            >
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <pointLight position={[-10, -10, -5]} intensity={0.5} />

              <NFT3DModel url={nft.metadata.modelUrl} />
              <Environment preset="city" />

              <OrbitControls
                enablePan={false}
                enableZoom={false}
                enableRotate={true}
                autoRotate={false}
                dampingFactor={0.05}
              />
            </Canvas>
          </Suspense>
        ) : (
          /* Fallback to image or default icon */
          nft.metadata.thumbnailUrl ? (
            <img
              src={nft.metadata.thumbnailUrl}
              alt={nft.metadata.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-500" />
            </div>
          )
        )}

        {/* Toggle button for 3D/Image view */}
        {has3DModel && nft.metadata.thumbnailUrl && (
          <div className="absolute top-2 left-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setShow3D(!show3D)}
              title={show3D ? "Show image" : "Show 3D model"}
            >
              {show3D ? "2D" : "3D"}
            </Button>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs bg-gray-700/80 text-gray-300 backdrop-blur-sm">
            #{nft.tokenId}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-1 text-white">{nft.metadata.name}</CardTitle>
        {nft.metadata.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {nft.metadata.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* 属性标签 */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
            {nft.metadata.artStyle}
          </Badge>
          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
            {nft.metadata.mode === 1 ? 'Refine' : 'Preview'}
          </Badge>
          {nft.metadata.hasTexture && (
            <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
              Textured
            </Badge>
          )}
        </div>

        {/* 统计信息 */}
        {nft.metadata.polycount > 0 && (
          <div className="text-xs text-gray-400">
            Polygons: {Number(nft.metadata.polycount).toLocaleString()}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        {/* Etherscan 链接 */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 text-xs hover:bg-neutral-50"
            onClick={() => {
              const url = `https://sepolia.etherscan.io/token/${nft.contractAddress}?a=${nft.tokenId}`;
              window.open(url, '_blank');
            }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View on Etherscan
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="flex-1 text-xs hover:bg-neutral-50"
            onClick={() => {
              // 添加到MetaMask的逻辑
              if (typeof window !== 'undefined' && window.ethereum) {
                window.ethereum.request({
                  method: 'wallet_watchAsset',
                  params: {
                    type: 'ERC721',
                    options: {
                      address: nft.contractAddress,
                      tokenId: nft.tokenId.toString(),
                    },
                  },
                });
              }
            }}
          >
            Add to MetaMask
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 显示可铸造的3D模型卡片
function MintableModelCard({ taskResult, onMintSuccess }: { taskResult: any; onMintSuccess?: (taskId: string) => void }) {
  const [show3D, setShow3D] = useState(false); // 默认显示图片
  const [modelLoadError, setModelLoadError] = useState(false);

  const handleDownload = () => {
    if (taskResult.model_urls?.obj) {
      window.open(taskResult.model_urls.obj, '_blank');
    }
  };

  const has3DModel = taskResult.model_urls?.glb;

  const handle3DToggle = () => {
    // Reset error state when switching back to 2D
    if (show3D) {
      setModelLoadError(false);
    }

    setShow3D(!show3D);
  };

  // 处理铸造成功回调
  const handleMintSuccessLocal = (hash: string) => {
    console.log('✅ Model minted successfully:', taskResult.id, hash);
    // 调用父组件的回调来移除这个模型
    onMintSuccess?.(taskResult.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden bg-white/50 backdrop-blur-sm border-neutral-200">
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Show 3D model if toggled on and available, otherwise show image */}
        {has3DModel && show3D && !modelLoadError ? (
          <ModelErrorBoundary onError={() => {
            console.error('Error boundary triggered for 3D model:', taskResult.id);
            setModelLoadError(true);
            setShow3D(false);
          }}>
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            }>
              <Canvas
                camera={{ position: [0, 0, 3], fov: 45 }}
                className="w-full h-full"
                onError={(error) => {
                  console.error('Canvas error for 3D model:', taskResult.id, error);
                  setModelLoadError(true);
                  setShow3D(false);
                }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />

                <NFT3DModel url={taskResult.model_urls.glb} />
                <Environment preset="city" />

                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  enableRotate={true}
                  autoRotate={false}
                  dampingFactor={0.05}
                />
              </Canvas>
            </Suspense>
          </ModelErrorBoundary>
        ) : modelLoadError ? (
          /* Show error message */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
            <div className="text-center p-4">
              <Box className="h-12 w-12 mx-auto text-red-400 mb-2" />
              <p className="text-xs text-red-600 mb-1">3D model failed to load</p>
              <p className="text-xs text-red-500">The model file may be expired or corrupted</p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 text-xs text-red-600 hover:text-red-700"
                onClick={() => {
                  setModelLoadError(false);
                  setShow3D(false);
                }}
              >
                Back to image
              </Button>
            </div>
          </div>
        ) : (
          /* Default: show image */
          taskResult.thumbnail_url ? (
            <img
              src={taskResult.thumbnail_url}
              alt={`3D Model ${taskResult.id}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles className="h-16 w-16 text-neutral-400" />
            </div>
          )
        )}

        {/* 3D/2D Toggle Button */}
        {has3DModel && taskResult.thumbnail_url && (
          <div className="absolute top-2 left-2 z-10">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-12 p-0 bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-900 text-xs font-medium border border-neutral-200"
              onClick={handle3DToggle}
              title={show3D ? "Show image" : "Show 3D model"}
              disabled={modelLoadError && show3D}
            >
              {show3D ? "2D" : "3D"}
            </Button>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs bg-blue-600 text-white font-medium shadow-sm">
            Ready to Mint
          </Badge>
        </div>
        <div className="absolute top-2 left-2" style={{ marginTop: has3DModel && taskResult.thumbnail_url ? '32px' : '0' }}>
          <Badge variant="outline" className="text-xs bg-white/80 backdrop-blur-sm border-neutral-300">
            {taskResult.mode}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-1 text-neutral-900">
          3D Model #{taskResult.id?.slice(-8)}
        </CardTitle>
        <p className="text-sm text-neutral-600 line-clamp-2">
          Generated 3D model ready for NFT minting
        </p>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* 模型信息 */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs border-neutral-300">
            {taskResult.art_style || 'Realistic'}
          </Badge>
          {taskResult.polycount && (
            <Badge variant="outline" className="text-xs border-neutral-300">
              {taskResult.polycount.toLocaleString()} poly
            </Badge>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          {/* 主要铸造按钮 */}
          <NFTMintDialog
            taskResult={taskResult}
            onMintSuccess={handleMintSuccessLocal}
            trigger={
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Mint as NFT
              </Button>
            }
          />

          {/* 辅助按钮 */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="flex-1 border-neutral-300 hover:bg-neutral-50"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-neutral-300 hover:bg-neutral-50"
              onClick={() => {
                if (navigator.share && taskResult.thumbnail_url) {
                  navigator.share({
                    title: `3D Model ${taskResult.id?.slice(-8)}`,
                    text: 'Check out this AI-generated 3D model!',
                    url: taskResult.thumbnail_url,
                  });
                }
              }}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
        {/* <Button
          size="sm"
          variant="ghost"
          className="w-full text-xs text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={() => {
            const url = `https://sepolia.etherscan.io/token/${nft.contractAddress}?a=${nft.tokenId}`;
            window.open(url, '_blank');
          }}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View on Etherscan
        </Button> */}
      </CardContent>
    </Card>
  );
}

export function TNFTPage() {
  const { isConnected, address } = useAccount();
  const { userNFTs, balance, totalSupply, isLoading } = useNFTQuery();
  const [mintableModels, setMintableModels] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  // 客户端挂载检测
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 从localStorage获取可铸造的模型
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 使用新的getReadyToMintModels方法获取所有待铸造模型
      const readyToMintModels = storage.getReadyToMintModels();
      console.log('📋 Ready to mint models:', readyToMintModels);
      setMintableModels(readyToMintModels);
    }
  }, []);

  // 清除已铸造的模型
  const removeMintableModel = (taskId: string) => {
    setMintableModels(prev => prev.filter(model => model.id !== taskId));
  };

  // 刷新待铸造模型列表
  const refreshMintableModels = () => {
    if (typeof window !== 'undefined') {
      const readyToMintModels = storage.getReadyToMintModels();
      console.log('🔄 Refreshed ready to mint models:', readyToMintModels);
      setMintableModels(readyToMintModels);
    }
  };

  // 监听localStorage变化，实时更新待铸造列表
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'meshy_all_successful_models' || e.key === 'meshy_minted_models') {
        refreshMintableModels();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 定期刷新（防止localStorage事件不触发）
    const interval = setInterval(refreshMintableModels, 10000); // 每10秒刷新一次

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 防止hydration错误
  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white">
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white">
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
            <Wallet className="h-12 w-12 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Connect Wallet</h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Connect your wallet to view and manage your 3D NFT collection
            </p>
          </div>
          <div className="text-gray-500 text-sm">
            Please use the &quot;Connect Wallet&quot; button in the top navigation
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full bg-black text-white">
      {/* 主要内容区域 */}
      <div className="flex gap-8 flex-1">
        {/* 左侧 33% - 统计信息 */}
        <div className="w-1/3 space-y-6 anim-b opacity-0 ![animation-delay:400ms]">
          {/* 我的 NFT */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">My NFTs</CardTitle>
              <Coins className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{balance}</div>
              <p className="text-xs text-gray-400 mt-1">
                Total NFTs owned
              </p>
            </CardContent>
          </Card>

          {/* 可铸造模型 */}
          <Card className="bg-white/50 backdrop-blur-sm border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-700">Ready to Mint</CardTitle>
              <Upload className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900">{mintableModels.length}</div>
              <p className="text-xs text-neutral-500 mt-1">
                3D models ready for minting
              </p>
            </CardContent>
          </Card>

          {/* 我的创作 */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">My Creations</CardTitle>
              <Palette className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{userNFTs.length}</div>
              <p className="text-xs text-gray-400 mt-1">
                3D models created
              </p>
            </CardContent>
          </Card>

          {/* 总发行量 */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Supply</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalSupply}</div>
              <p className="text-xs text-gray-400 mt-1">
                Platform total NFTs
              </p>
            </CardContent>
          </Card>

          {/* 创作新作品按钮 */}
          <Button asChild className="w-full bg-blue-700 hover:bg-blue-600 text-white">
            <Link href="/generate">
              <Palette className="mr-2 h-4 w-4" />
              Create New Work
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>




        </div>

        {/* 右侧 67% - 分为两个区域 */}
        <div className="w-2/3 space-y-6 anim-b opacity-0 ![animation-delay:500ms]">
          {/* 可铸造模型区域 */}
          {mintableModels.length > 0 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mintableModels.map((model) => (
                  <MintableModelCard
                    key={model.id}
                    taskResult={model}
                    onMintSuccess={removeMintableModel}
                  />
                ))}
                {/* <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">My Works</h2>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {userNFTs.length} items
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">Loading...</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Fetching your NFT collection
                  </p>
                </div>
              </div>
            </div>
          ) : userNFTs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2">
              {userNFTs.map((nft) => (
                <TNFTCard key={nft.tokenId} nft={nft} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">No NFTs Yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Start creating your first 3D NFT artwork
                  </p>
                </div>
                <Button asChild className="bg-blue-700 hover:bg-blue-600">
                  <Link href="/generate">
                    <Palette className="mr-2 h-4 w-4" />
                    Start Creating
                  </Link>
                </Button> */}
              </div>

              <div className="h-px bg-neutral-200"></div>
            </div>
          )}

          {/* 我的NFT作品区域 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">My NFT Collection</h2>
              <Badge variant="outline" className="border-neutral-300">
                {userNFTs.length} items
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-neutral-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-neutral-900">Loading...</h3>
                    <p className="text-neutral-600 max-w-md mx-auto">
                      Fetching your NFT collection
                    </p>
                  </div>
                </div>
              </div>
            ) : userNFTs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {userNFTs.map((nft) => (
                  <TNFTCard key={nft.tokenId} nft={nft} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-neutral-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-neutral-900">No NFTs Yet</h3>
                    <p className="text-neutral-600 max-w-md mx-auto">
                      {mintableModels.length > 0
                        ? "Mint your generated 3D models above to create your first NFT"
                        : "Start creating your first 3D NFT artwork"
                      }
                    </p>
                  </div>
                  {mintableModels.length === 0 && (
                    <Button asChild className="bg-neutral-900 hover:bg-neutral-800">
                      <Link href="/generate">
                        <Palette className="mr-2 h-4 w-4" />
                        Start Creating
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
