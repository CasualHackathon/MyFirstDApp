#  Memory Fragments DApp

一個基於區塊鏈的記憶碎片去中心化應用程式，結合 AI 故事生成和 NFT 鑄造功能。

##  專案特色

- **記憶碎片管理**：上傳和管理個人記憶碎片
- **AI 故事生成**：使用 OpenAI 將碎片組合成完整故事
- **NFT 鑄造**：將故事鑄造為獨一無二的 NFT
- **Web3 整合**：完整的錢包連接和區塊鏈互動
- **響應式設計**：支援桌面和行動裝置

##  技術架構

### 前端
- **React 18** + **Vite** 
- **TailwindCSS** 
- **RainbowKit** + **wagmi**
- **Heroicons**

### 區塊鏈
- **Solidity ^0.8.19**
- **Hardhat** 
- **OpenZeppelin**
- **Sepolia 測試網**

### AI & 儲存
- **OpenAI GPT** 
- **IPFS (Pinata)** 



## :file_folder: 專案結構

```
memory-fragments-dapp/
├── contracts/               # 智能合約
│   └── MemoryFragments.sol # 主要 NFT 合約
├── frontend/               # React 前端應用
│   ├── src/
│   │   ├── components/     # React 元件
│   │   ├── config/         # Web3 配置
│   │   └── styles/         # 樣式檔案
├── scripts/                # 部署腳本
├── test/                   # 測試檔案
├── hardhat.config.js       # Hardhat 配置
└── package.json           # 專案依賴
```

## :video_game: 使用方式

1. **連接錢包**：點擊右上角連接 MetaMask
2. **創建碎片**：上傳記憶內容和相關資訊
3. **選擇碎片**：在畫廊中選擇要組合的碎片
4. **生成故事**：AI 自動將碎片組合成完整故事
5. **鑄造 NFT**：將故事鑄造為區塊鏈 NFT



---

**:warning: 免責聲明**：本專案僅供學習和測試用途，請勿在正式環境中使用未經充分測試的程式碼。
