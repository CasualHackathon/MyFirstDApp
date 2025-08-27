import React, { useState } from 'react';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { chains, wagmiConfig } from './config/web3';
import Header from './components/Header';
import MemoryUpload from './components/MemoryUpload';
import MemoryGallery from './components/MemoryGallery';
import StoryCreator from './components/StoryCreator';
import WelcomeScreen from './components/WelcomeScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [userFragments, setUserFragments] = useState([]);
  const [selectedFragments, setSelectedFragments] = useState([]);

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const addFragment = (fragment) => {
    setUserFragments(prev => [...prev, fragment]);
  };

  const toggleFragmentSelection = (fragmentId) => {
    setSelectedFragments(prev => 
      prev.includes(fragmentId)
        ? prev.filter(id => id !== fragmentId)
        : [...prev, fragmentId]
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={() => handleViewChange('upload')} />;
      
      case 'upload':
        return (
          <MemoryUpload 
            onFragmentUploaded={addFragment}
            onNavigate={handleViewChange}
            existingFragments={userFragments}
          />
        );
      
      case 'gallery':
        return (
          <MemoryGallery 
            fragments={userFragments}
            selectedFragments={selectedFragments}
            onToggleSelection={toggleFragmentSelection}
            onNavigate={handleViewChange}
          />
        );
      
      case 'create-story':
        return (
          <StoryCreator 
            selectedFragments={selectedFragments.map(id => 
              userFragments.find(f => f.id === id)
            ).filter(Boolean)}
            onStoryCreated={() => {
              setSelectedFragments([]);
              handleViewChange('gallery');
            }}
            onNavigate={handleViewChange}
          />
        );
      
      default:
        return <WelcomeScreen onGetStarted={() => handleViewChange('upload')} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <div className="min-h-screen bg-gradient-to-br from-memory-50 to-memory-100">
            <Header 
              currentView={currentView}
              onViewChange={handleViewChange}
              fragmentCount={userFragments.length}
              selectedCount={selectedFragments.length}
            />
            
            <main className="container mx-auto px-4 py-8">
              <div className="animate-fade-in">
                {renderCurrentView()}
              </div>
            </main>
            
            <footer className="bg-white/50 backdrop-blur-sm border-t border-memory-200 mt-16">
              <div className="container mx-auto px-4 py-6 text-center text-memory-600">
                <p className="text-sm">
                  🧩 Memory Fragments DApp - 讓每個記憶都成為永恆的數位資產
                </p>
                <div className="mt-2 text-xs space-x-4">
                  <span>碎片數量: {userFragments.length}</span>
                  <span>已選擇: {selectedFragments.length}</span>
                  <span>當前視圖: {currentView}</span>
                </div>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default App;
