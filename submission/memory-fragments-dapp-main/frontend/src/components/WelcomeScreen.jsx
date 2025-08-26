import React from 'react';
import { useAccount } from 'wagmi';
import { 
  PuzzlePieceIcon, 
  SparklesIcon, 
  HeartIcon,
  PhotoIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const WelcomeScreen = ({ onGetStarted }) => {
  const { isConnected } = useAccount();

  const features = [
    {
      icon: PhotoIcon,
      title: '收集記憶碎片',
      description: '上傳照片、文字、音頻等珍貴記憶',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: SparklesIcon,
      title: 'AI智能拼圖',
      description: '人工智能幫你重構完整的記憶故事',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: PuzzlePieceIcon,
      title: '生成獨特NFT',
      description: '將記憶故事永久保存為數位資產',
      color: 'from-green-400 to-green-600'
    }
  ];

  const memoryTypes = [
    { icon: PhotoIcon, name: '照片', description: '珍藏的瞬間' },
    { icon: DocumentTextIcon, name: '文字', description: '日記片段' },
    { icon: MusicalNoteIcon, name: '聲音', description: '語音留言' },
    { icon: HeartIcon, name: '情感', description: '內心感受' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* 主要標題區域 */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-memory-400 to-memory-600 rounded-full mb-6 animate-pulse-soft">
          <PuzzlePieceIcon className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-memory-800 mb-6">
          <span className="bg-gradient-to-r from-memory-600 to-memory-800 bg-clip-text text-transparent">
            Memory Fragments
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-memory-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          用 AI 重新拼湊你的珍貴記憶，將零散的記憶碎片重構成完整的人生故事，並永久保存為 NFT 數位資產
        </p>

        {/* CTA按鈕 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isConnected ? (
            <button
              onClick={onGetStarted}
              className="group flex items-center space-x-2 bg-gradient-to-r from-memory-500 to-memory-600 hover:from-memory-600 hover:to-memory-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span>開始創建記憶</span>
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm border border-memory-200 px-8 py-4 rounded-full">
              <p className="text-memory-600 font-medium">
                請先連接錢包開始使用
              </p>
            </div>
          )}
          
          <button className="text-memory-600 hover:text-memory-700 font-medium underline decoration-2 underline-offset-4 hover:decoration-memory-500 transition-colors">
            了解更多
          </button>
        </div>
      </div>

      {/* 功能特色 */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="group relative">
              <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-memory-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-memory-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 支持的記憶類型 */}
      <div className="bg-white/50 backdrop-blur-sm border border-memory-200 rounded-3xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-memory-800 text-center mb-8">
          支持多種記憶類型
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {memoryTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-memory-100 to-memory-200 rounded-2xl mb-4 group-hover:from-memory-200 group-hover:to-memory-300 transition-all duration-300">
                  <Icon className="h-8 w-8 text-memory-600" />
                </div>
                <h4 className="font-semibold text-memory-800 mb-1">
                  {type.name}
                </h4>
                <p className="text-sm text-memory-600">
                  {type.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 使用流程 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-memory-800 mb-8">
          三步驟創建你的記憶NFT
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-memory-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="font-semibold text-memory-800 mb-2">上傳記憶</h3>
            <p className="text-memory-600 text-sm">收集珍貴的記憶碎片</p>
          </div>
          
          <ArrowRightIcon className="h-6 w-6 text-memory-400 hidden md:block" />
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-memory-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="font-semibold text-memory-800 mb-2">AI重構</h3>
            <p className="text-memory-600 text-sm">智能拼湊完整故事</p>
          </div>
          
          <ArrowRightIcon className="h-6 w-6 text-memory-400 hidden md:block" />
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-memory-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="font-semibold text-memory-800 mb-2">鑄造NFT</h3>
            <p className="text-memory-600 text-sm">永久保存數位資產</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
