import React, { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction, usePrepareContractWrite, useNetwork } from 'wagmi';
import { 
  SparklesIcon,
  PuzzlePieceIcon,
  ArrowLeftIcon,
  ClockIcon,
  HeartIcon,
  UserGroupIcon,
  MapPinIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// 導入合約配置
import { CONTRACT_CONFIG, CONTRACT_ABI } from '../config/web3';

const StoryCreator = ({ selectedFragments, onStoryCreated, onNavigate }) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [storyMetadata, setStoryMetadata] = useState({
    title: '',
    theme: '',
    timespan: '',
    keyPeople: [],
    locations: [],
    emotionalArc: []
  });
  
  // 區塊鏈交易狀態
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [storyId, setStoryId] = useState(null);
  const [isMintingNFT, setIsMintingNFT] = useState(false);
  const [nftTokenId, setNftTokenId] = useState(null);

  // 獲取當前網絡的合約地址
  const getContractAddress = () => {
    const chainId = chain?.id;
    console.log('當前網絡 ID:', chainId);
    console.log('可用合約地址:', CONTRACT_CONFIG.addresses);
    
    // 優先使用當前網絡的合約地址
    if (chainId && CONTRACT_CONFIG.addresses[chainId]) {
      return CONTRACT_CONFIG.addresses[chainId];
    }
    
    // 備用：使用本地網絡地址
    return CONTRACT_CONFIG.addresses[31337] || CONTRACT_CONFIG.addresses[11155111];
  };

  const contractAddress = getContractAddress();
  console.log('使用的合約地址:', contractAddress);

  // 準備createStory交易
  const { config: createStoryConfig, error: prepareError } = usePrepareContractWrite({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'createStory',
    args: generatedStory ? [
      selectedFragments.map(f => f.id), // fragmentIds
      `ipfs://story-${Date.now()}`, // aiStoryHash (模擬IPFS哈希)
      generatedStory.title,
      generatedStory.metadata.emotionalIntensity
    ] : [],
    enabled: !!generatedStory && !!contractAddress && !isCreatingStory && isConnected
  });

  const { 
    write: createStory, 
    data: createStoryData,
    isLoading: isCreateStoryLoading,
    error: createStoryError 
  } = useContractWrite(createStoryConfig);

  const { 
    data: createStoryReceipt,
    isLoading: isCreateStoryWaiting,
    isSuccess: isCreateStorySuccess,
    error: createStoryReceiptError
  } = useWaitForTransaction({
    hash: createStoryData?.hash,
  });

  // 準備mintNFT交易
  const { config: mintNFTConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'mintStoryNFT',
    args: storyId ? [storyId] : [],
    enabled: !!storyId && !!contractAddress && !isMintingNFT && isConnected
  });

  const { 
    write: mintNFT, 
    data: mintNFTData,
    isLoading: isMintNFTLoading,
    error: mintNFTError 
  } = useContractWrite(mintNFTConfig);

  const { 
    data: mintNFTReceipt,
    isLoading: isMintNFTWaiting,
    isSuccess: isMintNFTSuccess,
    error: mintNFTReceiptError
  } = useWaitForTransaction({
    hash: mintNFTData?.hash,
  });

  // AI故事生成
  const generateStory = async () => {
    if (!selectedFragments || selectedFragments.length === 0) return;

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const analysis = analyzeFragments(selectedFragments);
      const story = await createStoryFromFragments(selectedFragments, analysis);
      
      setGeneratedStory(story);
      setStoryMetadata(analysis);
      
    } catch (error) {
      console.error('故事生成失敗:', error);
      alert('故事生成失敗，請重試');
    } finally {
      setIsGenerating(false);
    }
  };

  // 保存故事到區塊鏈
  const saveStoryToBlockchain = async () => {
    console.log('開始保存故事到區塊鏈');
    console.log('isConnected:', isConnected);
    console.log('contractAddress:', contractAddress);
    console.log('createStory function:', !!createStory);
    console.log('generatedStory:', !!generatedStory);
    
    if (!isConnected) {
      alert('請先連接 MetaMask 錢包！');
      return;
    }

    if (!contractAddress) {
      alert('找不到智能合約地址，請檢查網絡配置！');
      return;
    }

    if (!generatedStory) {
      alert('請先生成故事！');
      return;
    }

    if (!createStory) {
      console.error('prepareError:', prepareError);
      alert(`準備交易失敗: ${prepareError?.message || '未知錯誤'}`);
      return;
    }
    
    try {
      setIsCreatingStory(true);
      
      console.log('正在創建故事到區塊鏈...');
      await createStory();
      
    } catch (error) {
      console.error('創建故事失敗:', error);
      alert(`創建故事失敗: ${error.message}`);
      setIsCreatingStory(false);
    }
  };

  // 鑄造NFT
  const mintStoryNFT = async () => {
    if (!storyId || !mintNFT) return;
    
    try {
      setIsMintingNFT(true);
      
      console.log('正在鑄造NFT...');
      await mintNFT();
      
    } catch (error) {
      console.error('鑄造NFT失敗:', error);
      alert(`鑄造NFT失敗: ${error.message}`);
      setIsMintingNFT(false);
    }
  };

  // 監聽交易完成
  useEffect(() => {
    if (isCreateStorySuccess && createStoryReceipt) {
      console.log('故事創建成功!', createStoryReceipt);
      
      // 從交易日誌中提取story ID（簡化處理）
      const newStoryId = Date.now() % 1000; // 簡化的 ID 生成
      setStoryId(newStoryId);
      setIsCreatingStory(false);
      
      alert(`✅ 故事創建成功！Story ID: ${newStoryId}`);
      
      // 自動開始鑄造NFT
      setTimeout(() => {
        mintStoryNFT();
      }, 1000);
    }
  }, [isCreateStorySuccess, createStoryReceipt]);

  useEffect(() => {
    if (isMintNFTSuccess && mintNFTReceipt) {
      console.log('NFT鑄造成功!', mintNFTReceipt);
      
      // 從交易日誌中提取token ID
      const newTokenId = Date.now() % 10000;
      setNftTokenId(newTokenId);
      setIsMintingNFT(false);
      
      // 顯示成功消息
      alert(`🎉 NFT鑄造成功！\nToken ID: ${newTokenId}\n交易哈希: ${mintNFTData?.hash}`);
      
      // 返回到畫廊
      setTimeout(() => {
        onStoryCreated();
      }, 2000);
    }
  }, [isMintNFTSuccess, mintNFTReceipt, mintNFTData, onStoryCreated]);

  // 錯誤處理
  useEffect(() => {
    if (createStoryError) {
      console.error('創建故事錯誤:', createStoryError);
      setIsCreatingStory(false);
    }
    if (mintNFTError) {
      console.error('鑄造NFT錯誤:', mintNFTError);
      setIsMintingNFT(false);
    }
  }, [createStoryError, mintNFTError]);

  const analyzeFragments = (fragments) => {
    const emotions = fragments.map(f => f.emotionScore || Math.random() * 10);
    const avgEmotion = emotions.reduce((sum, e) => sum + e, 0) / emotions.length;
    
    return {
      title: `我的記憶故事 ${Date.now()}`,
      theme: '生活回憶',
      timespan: '一段美好時光',
      keyPeople: ['家人', '朋友'],
      locations: ['家', '學校'],
      emotionalArc: fragments.map(f => ({
        time: new Date(f.timestamp).toLocaleDateString(),
        emotion: f.emotionScore || Math.random() * 10,
        title: f.title
      })),
      emotionalIntensity: Math.round(avgEmotion)
    };
  };

  const createStoryFromFragments = async (fragments, analysis) => {
    return {
      title: analysis.title,
      summary: `這是一個包含${fragments.length}個記憶碎片的美好故事，講述了生活中的珍貴時刻。`,
      chapters: fragments.map((fragment, index) => ({
        id: index + 1,
        title: fragment.title,
        content: fragment.content,
        originalFragment: fragment,
        emotion: fragment.emotionScore || Math.random() * 10,
        timestamp: fragment.timestamp
      })),
      metadata: {
        fragmentCount: fragments.length,
        timespan: analysis.timespan,
        theme: analysis.theme,
        emotionalIntensity: analysis.emotionalIntensity,
        createdAt: Date.now()
      }
    };
  };

  // 自動開始生成故事
  useEffect(() => {
    if (selectedFragments && selectedFragments.length > 0) {
      generateStory();
    }
  }, [selectedFragments]);

  if (!selectedFragments || selectedFragments.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <PuzzlePieceIcon className="h-20 w-20 text-memory-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-memory-800 mb-4">
          還沒有選擇記憶碎片
        </h2>
        <p className="text-memory-600 mb-8">
          請先到記憶畫廊選擇要用於創建故事的記憶碎片
        </p>
        <button
          onClick={() => onNavigate('gallery')}
          className="btn-primary"
        >
          返回記憶畫廊
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 頭部 */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => onNavigate('gallery')}
            className="p-2 hover:bg-memory-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-memory-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-memory-800">
              AI 記憶故事創建器
            </h1>
            <p className="text-memory-600">
              正在為你的 {selectedFragments.length} 個記憶碎片創建完整故事
            </p>
            {/* 調試信息 */}
            <div className="text-xs text-gray-500 mt-2">
              網絡: {chain?.name || '未連接'} | 
              合約地址: {contractAddress ? `${contractAddress.slice(0,10)}...` : '未配置'} |
              錢包: {isConnected ? '已連接' : '未連接'}
            </div>
          </div>
        </div>
      </div>

      {isGenerating ? (
        // 生成中界面
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-memory-400 to-memory-600 rounded-full mb-6 animate-pulse">
            <SparklesIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-memory-800 mb-4">
            AI 正在分析你的記憶...
          </h2>
          <p className="text-memory-600">預計還需要幾秒鐘...</p>
        </div>
      ) : generatedStory ? (
        // 故事展示界面
        <div className="space-y-8">
          {/* 區塊鏈交易狀態 */}
          {(isCreatingStory || isMintingNFT || nftTokenId) && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">
                🔗 區塊鏈交易狀態
              </h3>
              
              {isCreatingStory && (
                <div className="flex items-center space-x-3 mb-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-700">正在創建故事到區塊鏈...</span>
                  {createStoryData?.hash && (
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${createStoryData.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      查看交易: {createStoryData.hash.slice(0, 10)}...
                    </a>
                  )}
                </div>
              )}
              
              {isMintingNFT && (
                <div className="flex items-center space-x-3 mb-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-700">正在鑄造NFT...</span>
                  {mintNFTData?.hash && (
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${mintNFTData.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      查看交易: {mintNFTData.hash.slice(0, 10)}...
                    </a>
                  )}
                </div>
              )}
              
              {nftTokenId && (
                <div className="flex items-center space-x-3 text-green-700">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="font-semibold">
                    🎉 NFT鑄造成功！Token ID: {nftTokenId}
                  </span>
                </div>
              )}
              
              {(createStoryError || mintNFTError || prepareError) && (
                <div className="flex items-center space-x-3 text-red-700 bg-red-50 p-3 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">交易失敗:</div>
                    <div className="text-sm">
                      {createStoryError?.message || mintNFTError?.message || prepareError?.message}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 故事內容 */}
          <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-memory-800">
                {generatedStory.title}
              </h2>
              <div className="text-sm text-memory-600 bg-memory-100 px-3 py-1 rounded-full">
                {generatedStory.chapters.length} 個章節
              </div>
            </div>
            
            <p className="text-memory-700 mb-6 text-lg leading-relaxed">
              {generatedStory.summary}
            </p>
            
            {/* 故事章節預覽 */}
            <div className="space-y-4">
              {generatedStory.chapters.slice(0, 2).map((chapter, index) => (
                <div key={chapter.id} className="bg-memory-50 rounded-lg p-4 border-l-4 border-memory-300">
                  <h4 className="font-semibold text-memory-800 mb-2 flex items-center">
                    <BookOpenIcon className="h-5 w-5 mr-2" />
                    第 {index + 1} 章：{chapter.title}
                  </h4>
                  <p className="text-memory-700">{chapter.content}</p>
                  <div className="flex items-center mt-2 text-sm text-memory-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {new Date(chapter.timestamp).toLocaleDateString()}
                    <HeartIcon className="h-4 w-4 ml-4 mr-1" />
                    情感強度: {Math.round(chapter.emotion)}/10
                  </div>
                </div>
              ))}
              {generatedStory.chapters.length > 2 && (
                <div className="text-center text-memory-600 py-4 bg-memory-50 rounded-lg">
                  <BookOpenIcon className="h-6 w-6 mx-auto mb-2" />
                  還有 {generatedStory.chapters.length - 2} 個精彩章節等待發現...
                </div>
              )}
            </div>

            {/* 故事統計 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-memory-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-memory-600">{generatedStory.metadata.fragmentCount}</div>
                <div className="text-sm text-memory-500">記憶碎片</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-memory-600">{generatedStory.metadata.emotionalIntensity}/10</div>
                <div className="text-sm text-memory-500">情感強度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-memory-600">{generatedStory.chapters.length}</div>
                <div className="text-sm text-memory-500">故事章節</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-memory-600">{generatedStory.metadata.theme}</div>
                <div className="text-sm text-memory-500">主題</div>
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-center space-x-4 pt-8">
            <button
              onClick={() => {
                setGeneratedStory(null);
                setNftTokenId(null);
                setStoryId(null);
              }}
              className="btn-secondary"
              disabled={isCreatingStory || isMintingNFT}
            >
              重新生成故事
            </button>
            
            {!nftTokenId ? (
              <button
                onClick={saveStoryToBlockchain}
                disabled={isCreatingStory || isMintingNFT || !isConnected}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                title={
                  !isConnected ? '請先連接錢包' :
                  isCreatingStory ? '正在創建故事...' :
                  isMintingNFT ? '正在鑄造NFT...' :
                  '點擊保存故事並鑄造NFT'
                }
              >
                {isCreatingStory || isMintingNFT ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>
                      {isCreatingStory ? '創建故事中...' : '鑄造NFT中...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>保存故事並鑄造NFT</span>
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={onStoryCreated}
                className="btn-primary flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-5 w-5" />
                <span>完成並返回畫廊</span>
              </button>
            )}
          </div>

          {/* 幫助信息 */}
          {!isConnected && (
            <div className="text-center text-memory-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ExclamationTriangleIcon className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <p>請先連接 MetaMask 錢包才能鑄造 NFT</p>
            </div>
          )}
        </div>
      ) : (
        // 錯誤狀態
        <div className="text-center py-16">
          <XCircleIcon className="h-20 w-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-memory-800 mb-4">
            故事生成失敗
          </h2>
          <button onClick={generateStory} className="btn-primary">
            重新生成故事
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryCreator;
