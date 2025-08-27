import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  PhotoIcon, 
  PuzzlePieceIcon, 
  SparklesIcon,
  HomeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Header = ({ currentView, onViewChange, fragmentCount, selectedCount }) => {
  const navigationItems = [
    {
      id: 'welcome',
      name: '首頁',
      icon: HomeIcon,
      description: '歡迎頁面'
    },
    {
      id: 'upload',
      name: '上傳記憶',
      icon: PlusIcon,
      description: '添加新的記憶碎片'
    },
    {
      id: 'gallery',
      name: '記憶庫',
      icon: PhotoIcon,
      description: '查看所有記憶碎片',
      badge: fragmentCount > 0 ? fragmentCount : null
    },
    {
      id: 'create-story',
      name: '創建故事',
      icon: SparklesIcon,
      description: '用AI重構記憶故事',
      badge: selectedCount > 0 ? selectedCount : null,
      disabled: selectedCount === 0
    }
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-memory-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo和標題 */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-memory-500 rounded-lg">
              <PuzzlePieceIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-memory-800">
                Memory Fragments
              </h1>
              <p className="text-xs text-memory-600">記憶碎片拼圖</p>
            </div>
          </div>

          {/* 導航菜單 */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isDisabled = item.disabled;
              
              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && onViewChange(item.id)}
                  disabled={isDisabled}
                  className={`
                    relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-memory-500 text-white shadow-md' 
                      : isDisabled
                        ? 'text-memory-300 cursor-not-allowed'
                        : 'text-memory-600 hover:bg-memory-100 hover:text-memory-700'
                    }
                  `}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  
                  {/* 徽章顯示 */}
                  {item.badge && (
                    <span className={`
                      absolute -top-1 -right-1 h-5 w-5 text-xs rounded-full flex items-center justify-center
                      ${isActive ? 'bg-white text-memory-500' : 'bg-memory-500 text-white'}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* 移動端導航 */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="text-sm text-memory-600">
              {fragmentCount} 碎片
            </div>
          </div>

          {/* 錢包連接按鈕 */}
          <div className="flex items-center space-x-4">
            <ConnectButton 
              showBalance={false}
              chainStatus="icon"
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
          </div>
        </div>

        {/* 移動端導航菜單 */}
        <div className="md:hidden border-t border-memory-200 py-2">
          <div className="flex justify-around">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isDisabled = item.disabled;
              
              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && onViewChange(item.id)}
                  disabled={isDisabled}
                  className={`
                    relative flex flex-col items-center space-y-1 px-2 py-1 rounded-md text-xs transition-all
                    ${isActive 
                      ? 'text-memory-500' 
                      : isDisabled
                        ? 'text-memory-300 cursor-not-allowed'
                        : 'text-memory-600'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-memory-500 text-white rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
