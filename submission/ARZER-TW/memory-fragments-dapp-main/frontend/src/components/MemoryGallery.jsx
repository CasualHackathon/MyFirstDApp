import React, { useState, useMemo } from 'react';
import { 
  PhotoIcon, 
  DocumentTextIcon, 
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  HeartIcon,
  CalendarIcon,
  TagIcon,
  SparklesIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const MemoryGallery = ({ fragments, selectedFragments, onToggleSelection, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // 記憶類型圖標映射
  const typeIcons = {
    text: DocumentTextIcon,
    image: PhotoIcon,
    audio: MusicalNoteIcon
  };

  // 情感顏色映射
  const emotionColors = {
    20: 'bg-blue-100 text-blue-800 border-blue-300',
    40: 'bg-gray-100 text-gray-800 border-gray-300',
    60: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    80: 'bg-orange-100 text-orange-800 border-orange-300',
    100: 'bg-red-100 text-red-800 border-red-300'
  };

  // 獲取情感標籤
  const getEmotionLabel = (score) => {
    if (score <= 25) return '😢 悲傷';
    if (score <= 50) return '😌 平靜';
    if (score <= 75) return '😊 快樂';
    if (score <= 90) return '🤩 興奮';
    return '🥳 狂喜';
  };

  // 獲取情感顏色
  const getEmotionColor = (score) => {
    const key = Math.ceil(score / 20) * 20;
    return emotionColors[key] || emotionColors[60];
  };

  // 過濾和排序記憶碎片
  const filteredAndSortedFragments = useMemo(() => {
    let filtered = fragments.filter(fragment => {
      // 搜索過濾
      const matchesSearch = fragment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fragment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fragment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // 類型過濾
      const matchesType = filterType === 'all' || fragment.fragmentType === filterType;

      return matchesSearch && matchesType;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'emotional':
          return b.emotionScore - a.emotionScore;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [fragments, searchTerm, filterType, sortBy]);

  // 記憶卡片組件
  const MemoryCard = ({ fragment }) => {
    const TypeIcon = typeIcons[fragment.fragmentType];
    const isSelected = selectedFragments.includes(fragment.id);
    
    return (
      <div 
        className={`
          memory-card cursor-pointer relative group
          ${isSelected ? 'ring-2 ring-memory-500 bg-memory-50' : ''}
        `}
        onClick={() => onToggleSelection(fragment.id)}
      >
        {/* 選擇指示器 */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-10">
            <CheckCircleIcon className="h-6 w-6 text-memory-500" />
          </div>
        )}

        {/* 文件預覽 */}
        <div className="mb-4">
          {fragment.fragmentType === 'image' && fragment.file && (
            <div className="relative h-48 bg-memory-100 rounded-lg overflow-hidden">
              <img 
                src={URL.createObjectURL(fragment.file)} 
                alt={fragment.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          )}
          
          {fragment.fragmentType === 'audio' && fragment.file && (
            <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <MusicalNoteIcon className="h-12 w-12 text-purple-500" />
            </div>
          )}
          
          {fragment.fragmentType === 'text' && (
            <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 overflow-hidden">
              <p className="text-sm text-gray-600 line-clamp-6">
                {fragment.content}
              </p>
            </div>
          )}
        </div>

        {/* 記憶信息 */}
        <div className="space-y-3">
          {/* 標題和類型 */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-memory-800 text-lg leading-tight">
              {fragment.title}
            </h3>
            <div className="flex items-center space-x-1 text-memory-500 bg-memory-100 px-2 py-1 rounded-md">
              <TypeIcon className="h-4 w-4" />
              <span className="text-xs font-medium">
                {fragment.fragmentType}
              </span>
            </div>
          </div>

          {/* 情感指示器 */}
          <div className="flex items-center justify-between">
            <div className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
              ${getEmotionColor(fragment.emotionScore)}
            `}>
              {getEmotionLabel(fragment.emotionScore)}
            </div>
            <div className="flex items-center text-xs text-memory-500">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {new Date(fragment.timestamp).toLocaleDateString('zh-TW')}
            </div>
          </div>

          {/* 標籤 */}
          {fragment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {fragment.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-memory-100 text-memory-600 rounded-md text-xs"
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
              {fragment.tags.length > 3 && (
                <span className="text-xs text-memory-500 px-2 py-1">
                  +{fragment.tags.length - 3} 更多
                </span>
              )}
            </div>
          )}

          {/* 描述預覽 */}
          <p className="text-sm text-memory-600 line-clamp-2">
            {fragment.content}
          </p>

          {/* 品質評分 */}
          {fragment.validationScore && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-memory-500">品質評分</span>
              <span className={`font-bold ${
                fragment.validationScore >= 80 ? 'text-green-600' :
                fragment.validationScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {fragment.validationScore}/100
              </span>
            </div>
          )}
        </div>

        {/* 懸浮選擇提示 */}
        <div className="absolute inset-0 bg-memory-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-memory-200">
            <p className="text-sm text-memory-700">
              {isSelected ? '點擊取消選擇' : '點擊選擇此碎片'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 空狀態組件
  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="mb-6">
        <HeartIcon className="h-20 w-20 text-memory-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-memory-700 mb-2">
          還沒有記憶碎片
        </h3>
        <p className="text-memory-500">
          開始上傳你的珍貴記憶，讓AI幫你重構美好故事
        </p>
      </div>
      <button
        onClick={() => onNavigate('upload')}
        className="btn-primary"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        上傳第一個記憶
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* 頭部區域 */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-memory-800 mb-2">
              記憶畫廊
            </h1>
            <p className="text-memory-600">
              你有 {fragments.length} 個記憶碎片，已選擇 {selectedFragments.length} 個
            </p>
          </div>
          
          {selectedFragments.length > 0 && (
            <button
              onClick={() => onNavigate('create-story')}
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
            >
              <SparklesIcon className="h-5 w-5" />
              <span>創建故事 ({selectedFragments.length})</span>
            </button>
          )}
        </div>

        {/* 搜索和過濾器 */}
        <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-memory-400" />
              <input
                type="text"
                placeholder="搜索記憶碎片..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-memory-200 rounded-lg focus:ring-2 focus:ring-memory-400 focus:border-transparent"
              />
            </div>

            {/* 類型過濾 */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-memory-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-white/80 border border-memory-200 rounded-lg focus:ring-2 focus:ring-memory-400"
              >
                <option value="all">所有類型</option>
                <option value="text">文字</option>
                <option value="image">圖片</option>
                <option value="audio">音頻</option>
              </select>
            </div>

            {/* 排序選擇 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/80 border border-memory-200 rounded-lg focus:ring-2 focus:ring-memory-400"
            >
              <option value="newest">最新</option>
              <option value="oldest">最舊</option>
              <option value="emotional">情感強度</option>
              <option value="alphabetical">字母順序</option>
            </select>
          </div>
        </div>
      </div>

      {/* 記憶碎片網格 */}
      {fragments.length === 0 ? (
        <EmptyState />
      ) : filteredAndSortedFragments.length === 0 ? (
        <div className="text-center py-16">
          <MagnifyingGlassIcon className="h-16 w-16 text-memory-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-memory-700 mb-2">
            沒有找到匹配的記憶
          </h3>
          <p className="text-memory-500">
            嘗試調整搜索條件或過濾器
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedFragments.map((fragment) => (
            <MemoryCard key={fragment.id} fragment={fragment} />
          ))}
        </div>
      )}

      {/* 底部操作區域 */}
      {selectedFragments.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white/90 backdrop-blur-sm border border-memory-200 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-memory-700">
                已選擇 {selectedFragments.length} 個碎片
              </span>
              <button
                onClick={() => onNavigate('create-story')}
                className="bg-memory-500 hover:bg-memory-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                創建故事
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGallery;
