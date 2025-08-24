"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from 'wagmi';
import { MyFirstNFTABI, NFTMarketplaceABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { parseEther, formatEther } from 'viem';
import { ExternalLink } from "lucide-react";

export default function NFTPage() {
  const { address: connectedAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  // NFT Mint States
  const [mintStep, setMintStep] = useState(1);
  
  // NFT Transfer States
  const [transferStep, setTransferStep] = useState(1);
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [transferToAddress, setTransferToAddress] = useState('');
  
  // Marketplace States
  const [marketplaceMode, setMarketplaceMode] = useState<'select' | 'list' | 'browse'>('select');
  const [listingStep, setListingStep] = useState(1);
  const [selectedTokenForListing, setSelectedTokenForListing] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [approvalStep, setApprovalStep] = useState(1);
  const [marketplaceNFTs, setMarketplaceNFTs] = useState<any[]>([]);
  
  // Contract interaction
  const { writeContract, data: writeData, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Read user's NFTs
  const { data: userNFTs, refetch: refetchNFTs } = useReadContract({
    address: CONTRACT_ADDRESSES.MyFirstNFT,
    abi: MyFirstNFTABI,
    functionName: 'getTokensOwnedBy',
    args: connectedAddress ? [connectedAddress] : undefined,
  });

  // Read if user has claimed free NFT
  const { data: hasClaimedFree } = useReadContract({
    address: CONTRACT_ADDRESSES.MyFirstNFT,
    abi: MyFirstNFTABI,
    functionName: 'hasClaimedFreeNFT',
    args: connectedAddress ? [connectedAddress] : undefined,
  });

  // Check if marketplace is approved for user
  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    address: CONTRACT_ADDRESSES.MyFirstNFT,
    abi: MyFirstNFTABI,
    functionName: 'isApprovedForAll',
    args: connectedAddress ? [connectedAddress, CONTRACT_ADDRESSES.NFTMarketplace] : undefined,
  });

  // Handle transaction success for different operations
  useEffect(() => {
    if (isTxSuccess && writeData) {
      // Refetch NFTs and approval status when any transaction is successful
      refetchNFTs();
      refetchApproval();
      
      // Handle specific operations based on current step states
      if (approvalStep === 1) {
        // This was an approval transaction
        setTimeout(() => {
          setApprovalStep(2);
        }, 1000); // Give a small delay for the blockchain state to update
      }
    }
  }, [isTxSuccess, writeData, approvalStep, refetchNFTs, refetchApproval]);

  // Fetch marketplace NFTs when entering browse mode
  useEffect(() => {
    if (marketplaceMode === 'browse') {
      fetchMarketplaceNFTs();
    }
  }, [marketplaceMode, publicClient]);

  // Handle mint free NFT
  const handleMintFree = async () => {
    if (!isConnected || !connectedAddress) return;
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.MyFirstNFT,
        abi: MyFirstNFTABI,
        functionName: 'claimFreeNFT',
      });
      
      setMintStep(2);
    } catch (error) {
      console.error('Mint failed:', error);
    }
  };

  // Handle mint with payment
  const handleMintPaid = async () => {
    if (!isConnected || !connectedAddress) return;
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.MyFirstNFT,
        abi: MyFirstNFTABI,
        functionName: 'mint',
        value: parseEther('0.001'),
      });
      
      setMintStep(2);
    } catch (error) {
      console.error('Mint failed:', error);
    }
  };

  // Handle transfer NFT
  const handleTransfer = async () => {
    if (!isConnected || !connectedAddress || !selectedTokenId || !transferToAddress) return;
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.MyFirstNFT,
        abi: MyFirstNFTABI,
        functionName: 'transferFrom',
        args: [connectedAddress, transferToAddress as `0x${string}`, BigInt(selectedTokenId)],
      });
      
      setTransferStep(3);
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  // Handle approve marketplace
  const handleApproveMarketplace = async () => {
    if (!isConnected || !connectedAddress) return;
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.MyFirstNFT,
        abi: MyFirstNFTABI,
        functionName: 'setApprovalForAll',
        args: [CONTRACT_ADDRESSES.NFTMarketplace, true],
      });
      
      // Set approval step to 1 to indicate approval transaction is in progress
      setApprovalStep(1);
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  // Handle list NFT
  const handleListNFT = async () => {
    if (!isConnected || !connectedAddress || !selectedTokenForListing || !listingPrice) return;
    
    try {
      const priceInWei = parseEther(listingPrice);
      await writeContract({
        address: CONTRACT_ADDRESSES.NFTMarketplace,
        abi: NFTMarketplaceABI,
        functionName: 'listNFT',
        args: [CONTRACT_ADDRESSES.MyFirstNFT, BigInt(selectedTokenForListing), priceInWei],
      });
      
      setListingStep(4);
    } catch (error) {
      console.error('Listing failed:', error);
    }
  };

  // Fetch marketplace NFTs
  const fetchMarketplaceNFTs = async () => {
    if (!publicClient) return;
    
    try {
      // Get NFTListed events
      const listedEvents = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.NFTMarketplace,
        event: {
          type: 'event',
          name: 'NFTListed',
          inputs: [
            { name: 'listingId', type: 'bytes32', indexed: true },
            { name: 'seller', type: 'address', indexed: true },
            { name: 'nftContract', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: false },
            { name: 'price', type: 'uint256', indexed: false },
          ]
        },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });

      // Get NFTSold events to filter out sold NFTs
      const soldEvents = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.NFTMarketplace,
        event: {
          type: 'event',
          name: 'NFTSold',
          inputs: [
            { name: 'listingId', type: 'bytes32', indexed: true },
            { name: 'buyer', type: 'address', indexed: true },
            { name: 'seller', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: false },
            { name: 'price', type: 'uint256', indexed: false },
          ]
        },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });

      // Get NFTDelisted events to filter out delisted NFTs
      const delistedEvents = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.NFTMarketplace,
        event: {
          type: 'event',
          name: 'NFTDelisted',
          inputs: [
            { name: 'listingId', type: 'bytes32', indexed: true },
            { name: 'seller', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: false },
          ]
        },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });

      // Create sets of sold and delisted listing IDs
      const soldListingIds = new Set(soldEvents.map(event => event.topics[1]));
      const delistedListingIds = new Set(delistedEvents.map(event => event.topics[1]));

      // Filter active listings
      const activeListings = listedEvents.filter(event => {
        const listingId = event.topics[1];
        return !soldListingIds.has(listingId) && !delistedListingIds.has(listingId);
      });

      // Parse the active listings
      const nfts = activeListings.map(event => ({
        listingId: event.topics[1],
        seller: `0x${event.topics[2]?.slice(26)}`,
        nftContract: `0x${event.topics[3]?.slice(26)}`,
        tokenId: event.data ? parseInt(event.data.slice(0, 66), 16) : 0,
        price: event.data ? formatEther(BigInt('0x' + event.data.slice(66, 130))) : '0',
        blockNumber: event.blockNumber
      }));

      setMarketplaceNFTs(nfts);
    } catch (error) {
      console.error('Failed to fetch marketplace NFTs:', error);
    }
  };

  // Handle buy NFT
  const handleBuyNFT = async (listingId: string, price: string) => {
    if (!isConnected || !connectedAddress) return;
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.NFTMarketplace,
        abi: NFTMarketplaceABI,
        functionName: 'buyNFT',
        args: [listingId as `0x${string}`],
        value: parseEther(price),
      });
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Hero Section */}
      <section className="text-center py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            體驗 NFT 生態系統
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            完整的 NFT 體驗：鑄造、轉移、上架、交易
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {isConnected ? (
          <div className="space-y-8">
            <Tabs defaultValue="mint" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="mint">鑄造 NFT</TabsTrigger>
                <TabsTrigger value="transfer">轉移 NFT</TabsTrigger>
                <TabsTrigger value="marketplace">NFT 市場</TabsTrigger>
                <TabsTrigger value="manage">管理</TabsTrigger>
              </TabsList>

              {/* Mint Tab */}
              <TabsContent value="mint">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">鑄造您的 NFT</h3>
                  
                  <div className="space-y-6">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                      {[1, 2].map((step) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step <= mintStep ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {step}
                          </div>
                          {step < 2 && (
                            <div className={`w-16 h-1 ${
                              step < mintStep ? 'bg-purple-600' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>

                    {mintStep === 1 && (
                      <div className="text-center space-y-6">
                        <h4 className="font-semibold mb-4">選擇鑄造方式</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="p-6 border-2 border-green-200 bg-green-50">
                            <h5 className="font-semibold text-lg mb-2">🎁 免費 NFT</h5>
                            <p className="text-sm text-gray-600 mb-4">
                              每個錢包可以免費領取一個 NFT
                            </p>
                            {hasClaimedFree ? (
                              <Button disabled className="w-full">
                                已領取免費 NFT
                              </Button>
                            ) : (
                              <Button 
                                onClick={handleMintFree}
                                disabled={isWritePending || isTxLoading}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                {isWritePending || isTxLoading ? '鑄造中...' : '免費領取'}
                              </Button>
                            )}
                          </Card>
                          
                          <Card className="p-6 border-2 border-purple-200 bg-purple-50">
                            <h5 className="font-semibold text-lg mb-2">💎 付費 NFT</h5>
                            <p className="text-sm text-gray-600 mb-4">
                              付費 0.001 ETH 鑄造額外的 NFT
                            </p>
                            <Button 
                              onClick={handleMintPaid}
                              disabled={isWritePending || isTxLoading}
                              className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                              {isWritePending || isTxLoading ? '鑄造中...' : '付費鑄造 (0.001 ETH)'}
                            </Button>
                          </Card>
                        </div>
                      </div>
                    )}

                    {mintStep === 2 && (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">✅</span>
                        </div>
                        <h4 className="font-semibold text-lg mb-2">鑄造成功！</h4>
                        <p className="text-gray-600 mb-6">
                          您的 NFT 已成功鑄造，請查看您的收藏
                        </p>
                        <Button 
                          onClick={() => setMintStep(1)}
                        >
                          鑄造更多 NFT
                        </Button>
                      </div>
                    )}

                    {/* User's NFTs Display */}
                    <div className="mt-8">
                      <h4 className="font-semibold mb-4">您的 NFT 收藏</h4>
                      {userNFTs && (userNFTs as bigint[]).length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(userNFTs as bigint[]).map((tokenId) => (
                            <Card key={tokenId.toString()} className="p-4">
                              <div className="w-full h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-2 flex items-center justify-center text-white font-bold">
                                #{tokenId.toString()}
                              </div>
                              <p className="text-sm font-medium text-center">NFT #{tokenId.toString()}</p>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          您還沒有任何 NFT，趕快鑄造一個吧！
                        </div>
                      )}
                    </div>

                    {/* Transaction Status */}
                    {writeData && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertTitle>交易已提交</AlertTitle>
                        <AlertDescription>
                          {isTxLoading ? (
                            <>正在確認交易...</>
                          ) : isTxSuccess ? (
                            <>
                              交易成功！
                              <br />
                              <a 
                                href={`https://sepolia.etherscan.io/tx/${writeData}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              >
                                在 Etherscan 上查看 <ExternalLink className="h-3 w-3" />
                              </a>
                            </>
                          ) : (
                            <>
                              交易哈希: {writeData}
                              <br />
                              <a 
                                href={`https://sepolia.etherscan.io/tx/${writeData}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              >
                                在 Etherscan 上查看 <ExternalLink className="h-3 w-3" />
                              </a>
                            </>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Transfer Tab */}
              <TabsContent value="transfer">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">轉移 NFT</h3>
                  
                  <div className="space-y-6">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                      {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step <= transferStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {step}
                          </div>
                          {step < 3 && (
                            <div className={`w-16 h-1 ${
                              step < transferStep ? 'bg-blue-600' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>

                    {transferStep === 1 && (
                      <div>
                        <h4 className="font-semibold mb-4">步驟 1: 選擇要轉移的 NFT</h4>
                        {userNFTs && (userNFTs as bigint[]).length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(userNFTs as bigint[]).map((tokenId) => (
                              <Card
                                key={tokenId.toString()}
                                className={`p-4 cursor-pointer hover:bg-blue-50 ${
                                  selectedTokenId === tokenId.toString() ? 'border-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={() => setSelectedTokenId(tokenId.toString())}
                              >
                                <div className="w-full h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg mb-2 flex items-center justify-center text-white font-bold">
                                  #{tokenId.toString()}
                                </div>
                                <p className="text-sm font-medium text-center">NFT #{tokenId.toString()}</p>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            您還沒有任何 NFT，請先鑄造一個！
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-6">
                          <Button 
                            onClick={() => setTransferStep(2)}
                            disabled={!selectedTokenId}
                          >
                            下一步
                          </Button>
                        </div>
                      </div>
                    )}

                    {transferStep === 2 && (
                      <div>
                        <h4 className="font-semibold mb-4">步驟 2: 輸入接收地址</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">接收者錢包地址</label>
                            <Input
                              value={transferToAddress}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTransferToAddress(e.target.value)}
                              placeholder="0x..."
                              className="w-full font-mono"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              請確保地址正確，NFT 轉移後無法撤銷
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">轉移詳情</h5>
                            <div className="text-sm space-y-1">
                              <div>NFT ID: #{selectedTokenId}</div>
                              <div>接收地址: {transferToAddress || '尚未設定'}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-4 mt-6">
                          <Button variant="outline" onClick={() => setTransferStep(1)}>
                            上一步
                          </Button>
                          <Button 
                            onClick={handleTransfer}
                            disabled={!transferToAddress || isWritePending || isTxLoading}
                          >
                            {isWritePending || isTxLoading ? '轉移中...' : '確認轉移'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {transferStep === 3 && (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">✅</span>
                        </div>
                        <h4 className="font-semibold text-lg mb-2">轉移成功！</h4>
                        <p className="text-gray-600 mb-6">
                          NFT #{selectedTokenId} 已成功轉移
                        </p>
                        <Button 
                          onClick={() => {
                            setTransferStep(1);
                            setSelectedTokenId('');
                            setTransferToAddress('');
                          }}
                        >
                          轉移更多 NFT
                        </Button>
                      </div>
                    )}

                    {/* Transaction Status */}
                    {writeData && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertTitle>交易已提交</AlertTitle>
                        <AlertDescription>
                          {isTxLoading ? (
                            <>正在確認交易...</>
                          ) : isTxSuccess ? (
                            <>
                              交易成功！
                              <br />
                              <a 
                                href={`https://sepolia.etherscan.io/tx/${writeData}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              >
                                在 Etherscan 上查看 <ExternalLink className="h-3 w-3" />
                              </a>
                            </>
                          ) : (
                            <>
                              交易哈希: {writeData}
                              <br />
                              <a 
                                href={`https://sepolia.etherscan.io/tx/${writeData}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              >
                                在 Etherscan 上查看 <ExternalLink className="h-3 w-3" />
                              </a>
                            </>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Marketplace Tab */}
              <TabsContent value="marketplace">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">NFT 市場</h3>
                  
                  {!isApproved ? (
                    <div className="space-y-6">
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertTitle>需要授權</AlertTitle>
                        <AlertDescription>
                          在使用市場功能前，您需要授權 NFT 市場合約操作您的 NFT
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex items-center justify-center mb-8">
                        {[1, 2].map((step) => (
                          <div key={step} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              step <= approvalStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {step}
                            </div>
                            {step < 2 && (
                              <div className={`w-16 h-1 ${
                                step < approvalStep ? 'bg-green-600' : 'bg-gray-200'
                              }`} />
                            )}
                          </div>
                        ))}
                      </div>

                      {approvalStep === 1 && (
                        <div className="text-center">
                          <h4 className="font-semibold mb-4">授權 NFT 市場</h4>
                          <p className="text-gray-600 mb-6">
                            授權後您就可以在市場上架和交易 NFT
                          </p>
                          <Button 
                            onClick={handleApproveMarketplace}
                            disabled={isWritePending || isTxLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isWritePending || isTxLoading ? '授權中...' : '授權市場'}
                          </Button>
                        </div>
                      )}

                      {approvalStep === 2 && (
                        <Alert className="border-green-200 bg-green-50">
                          <AlertTitle>授權成功！</AlertTitle>
                          <AlertDescription>
                            您現在可以使用市場功能了。請重新載入頁面。
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Mode Selection */}
                      {marketplaceMode === 'select' && (
                        <div className="space-y-6">
                          <div className="text-center">
                            <h4 className="font-semibold mb-4">選擇您要使用的功能</h4>
                            <p className="text-gray-600 mb-8">
                              您可以上架自己的 NFT 或瀏覽市場中的 NFT
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card 
                              className="p-6 cursor-pointer hover:bg-orange-50 border-2 hover:border-orange-500 transition-all"
                              onClick={() => setMarketplaceMode('list')}
                            >
                              <div className="text-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <span className="text-2xl">📤</span>
                                </div>
                                <h5 className="font-semibold text-lg mb-2">上架 NFT</h5>
                                <p className="text-gray-600 text-sm">
                                  將您的 NFT 上架到市場進行銷售
                                </p>
                              </div>
                            </Card>
                            
                            <Card 
                              className="p-6 cursor-pointer hover:bg-blue-50 border-2 hover:border-blue-500 transition-all"
                              onClick={() => setMarketplaceMode('browse')}
                            >
                              <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <span className="text-2xl">🛍️</span>
                                </div>
                                <h5 className="font-semibold text-lg mb-2">瀏覽市場</h5>
                                <p className="text-gray-600 text-sm">
                                  查看並購買市場中的 NFT
                                </p>
                              </div>
                            </Card>
                          </div>
                        </div>
                      )}

                      {/* List NFT Mode */}
                      {marketplaceMode === 'list' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="font-semibold text-lg">上架 NFT</h4>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setMarketplaceMode('select');
                                setListingStep(1);
                                setSelectedTokenForListing('');
                                setListingPrice('');
                              }}
                            >
                              返回選擇
                            </Button>
                          </div>

                          {/* Progress Steps */}
                          <div className="flex items-center justify-center mb-8">
                            {[1, 2, 3, 4].map((step) => (
                              <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  step <= listingStep ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {step}
                                </div>
                                {step < 4 && (
                                  <div className={`w-16 h-1 ${
                                    step < listingStep ? 'bg-orange-600' : 'bg-gray-200'
                                  }`} />
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Listing Steps */}
                          {listingStep === 1 && (
                            <div>
                              <h4 className="font-semibold mb-4">步驟 1: 選擇要上架的 NFT</h4>
                              {userNFTs && (userNFTs as bigint[]).length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {(userNFTs as bigint[]).map((tokenId) => (
                                    <Card
                                      key={tokenId.toString()}
                                      className={`p-4 cursor-pointer hover:bg-orange-50 ${
                                        selectedTokenForListing === tokenId.toString() ? 'border-orange-500 bg-orange-50' : ''
                                      }`}
                                      onClick={() => setSelectedTokenForListing(tokenId.toString())}
                                    >
                                      <div className="w-full h-24 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg mb-2 flex items-center justify-center text-white font-bold">
                                        #{tokenId.toString()}
                                      </div>
                                      <p className="text-sm font-medium text-center">NFT #{tokenId.toString()}</p>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center text-gray-500 py-8">
                                  您還沒有任何 NFT，請先鑄造一個！
                                </div>
                              )}
                              
                              <div className="flex justify-end mt-6">
                                <Button 
                                  onClick={() => setListingStep(2)}
                                  disabled={!selectedTokenForListing}
                                >
                                  下一步
                                </Button>
                              </div>
                            </div>
                          )}

                          {listingStep === 2 && (
                            <div>
                              <h4 className="font-semibold mb-4">步驟 2: 設定價格</h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">售價 (ETH)</label>
                                  <Input
                                    value={listingPrice}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setListingPrice(e.target.value)}
                                    placeholder="0.01"
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    className="w-full"
                                  />
                                  <p className="text-sm text-gray-500 mt-1">
                                    設定您希望出售的價格（以 ETH 為單位）
                                  </p>
                                </div>
                                
                                <div className="bg-orange-50 p-4 rounded-lg">
                                  <h5 className="font-medium mb-2">上架詳情</h5>
                                  <div className="text-sm space-y-1">
                                    <div>NFT ID: #{selectedTokenForListing}</div>
                                    <div>售價: {listingPrice || '0'} ETH</div>
                                    <div>市場手續費: 2.5%</div>
                                    <div>您將收到: {listingPrice ? (parseFloat(listingPrice) * 0.975).toFixed(4) : '0'} ETH</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex space-x-4 mt-6">
                                <Button variant="outline" onClick={() => setListingStep(1)}>
                                  上一步
                                </Button>
                                <Button 
                                  onClick={() => setListingStep(3)}
                                  disabled={!listingPrice || parseFloat(listingPrice) <= 0}
                                >
                                  下一步
                                </Button>
                              </div>
                            </div>
                          )}

                          {listingStep === 3 && (
                            <div>
                              <h4 className="font-semibold mb-4">步驟 3: 確認上架</h4>
                              <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">NFT ID</span>
                                    <span>#{selectedTokenForListing}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">售價</span>
                                    <span>{listingPrice} ETH</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">市場手續費</span>
                                    <span>2.5%</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span className="text-gray-600">您將收到</span>
                                    <span>{listingPrice ? (parseFloat(listingPrice) * 0.975).toFixed(4) : '0'} ETH</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex space-x-4 mt-6">
                                <Button variant="outline" onClick={() => setListingStep(2)}>
                                  上一步
                                </Button>
                                <Button 
                                  onClick={handleListNFT}
                                  disabled={isWritePending || isTxLoading}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  {isWritePending || isTxLoading ? '上架中...' : '確認上架'}
                                </Button>
                              </div>
                            </div>
                          )}

                          {listingStep === 4 && (
                            <div className="text-center">
                              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">✅</span>
                              </div>
                              <h4 className="font-semibold text-lg mb-2">上架成功！</h4>
                              <p className="text-gray-600 mb-6">
                                您的 NFT #{selectedTokenForListing} 已成功上架到市場
                              </p>
                              <Button 
                                onClick={() => {
                                  setListingStep(1);
                                  setSelectedTokenForListing('');
                                  setListingPrice('');
                                  setMarketplaceMode('select');
                                }}
                              >
                                返回市場
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Browse Marketplace Mode */}
                      {marketplaceMode === 'browse' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="font-semibold text-lg">市場瀏覽</h4>
                            <Button 
                              variant="outline" 
                              onClick={() => setMarketplaceMode('select')}
                            >
                              返回選擇
                            </Button>
                          </div>

                          {marketplaceNFTs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {marketplaceNFTs.map((nft, index) => (
                                <Card key={index} className="p-4">
                                  <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg mb-4 flex items-center justify-center text-white font-bold">
                                    #{nft.tokenId}
                                  </div>
                                  <div className="space-y-2">
                                    <h5 className="font-semibold">NFT #{nft.tokenId}</h5>
                                    <p className="text-sm text-gray-600">
                                      賣家: {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}
                                    </p>
                                    <p className="text-lg font-bold text-blue-600">
                                      {nft.price} ETH
                                    </p>
                                    {connectedAddress?.toLowerCase() === nft.seller.toLowerCase() ? (
                                      <Button disabled className="w-full">
                                        這是您的 NFT
                                      </Button>
                                    ) : (
                                      <Button 
                                        onClick={() => handleBuyNFT(nft.listingId, nft.price)}
                                        disabled={isWritePending || isTxLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                      >
                                        {isWritePending || isTxLoading ? '購買中...' : `購買 ${nft.price} ETH`}
                                      </Button>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🛍️</span>
                              </div>
                              <h5 className="font-semibold text-lg mb-2">市場暫時沒有 NFT</h5>
                              <p className="text-gray-600">
                                目前市場上沒有可購買的 NFT，請稍後再來查看
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Transaction Status */}
                      {writeData && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <AlertTitle>交易已提交</AlertTitle>
                          <AlertDescription>
                            {isTxLoading ? (
                              <>正在確認交易...</>
                            ) : isTxSuccess ? (
                              <>
                                交易成功！
                                <br />
                                <a 
                                  href={`https://sepolia.etherscan.io/tx/${writeData}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  在 Etherscan 上查看 <ExternalLink className="h-3 w-3" />
                                </a>
                              </>
                            ) : (
                              <>
                                交易哈希: {writeData}
                                <br />
                                <a 
                                  href={`https://sepolia.etherscan.io/tx/${writeData}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  在 Etherscan 上查看 <ExternalLink className="h-3 w-3" />
                                </a>
                              </>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Manage Tab */}
              <TabsContent value="manage">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">管理您的 NFT</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">🏪 已上架的 NFT</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        查看和管理您在市場上架的 NFT
                      </p>
                      <Button variant="outline" className="w-full">
                        查看上架項目
                      </Button>
                    </Card>
                    
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">📊 交易歷史</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        查看您的 NFT 買賣交易記錄
                      </p>
                      <Button variant="outline" className="w-full">
                        查看歷史
                      </Button>
                    </Card>
                  </div>

                  <div className="mt-8">
                    <h4 className="font-medium mb-4">合約資訊</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">NFT 合約</span>
                        <span className="font-mono">{CONTRACT_ADDRESSES.MyFirstNFT}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">市場合約</span>
                        <span className="font-mono">{CONTRACT_ADDRESSES.NFTMarketplace}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">網路</span>
                        <span>Sepolia 測試網</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Error Display */}
            {writeError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTitle>操作失敗</AlertTitle>
                <AlertDescription>
                  {writeError.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-4">請連接您的錢包</h3>
            <p className="text-gray-600">
              您需要連接錢包才能使用 NFT 功能
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
