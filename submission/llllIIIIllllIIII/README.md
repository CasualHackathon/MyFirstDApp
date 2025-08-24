# 🚀 MyFirstDapp - 完整的 Web3 DeFi 生態體驗平台

> 一個專為 Web3 新手設計的 DeFi 生態系統演示應用，部署在 Sepolia 測試網上，提供安全無成本的學習環境。

[![Next.js](https://img.shields.io/badge/Next.js-15.4.7-black)](https://nextjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.26.3-yellow)](https://hardhat.org/)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://soliditylang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## � 專案簡介

MyFirstDapp 是一個綜合性的 DeFi 生態系統，包含代幣交換、質押挖礦、流動性挖礦、NFT 市場等核心功能。所有功能都部署在 Sepolia 測試網上，讓用戶可以安全地學習和體驗 Web3 技術，無需使用真實資金。

## ✨ 核心功能

### 🪙 代幣系統
- **多種測試代幣**: TEST Token、TESTB Token、Reward Token
- **代幣水龍頭**: 每日免費領取測試代幣
- **轉帳功能**: 支援代幣轉移和授權操作
- **實時餘額**: 動態顯示所有代幣餘額

### 🔄 DeFi 交換 (SimpleSwap)
- **雙向交換**: TEST ↔ TESTB 無縫交換
- **AMM 機制**: 自動做市商算法定價
- **滑點保護**: 可設定最小輸出防止價格滑點
- **實時報價**: 基於流動性池的即時價格計算

### 🏦 質押挖礦 (SimpleStaking)
- **代幣質押**: 質押 TEST 代幣獲得 REWARD 獎勵
- **複利計算**: 支援複利的獎勵分發機制
- **靈活操作**: 隨時質押、取消質押、領取獎勵
- **APY 顯示**: 實時顯示年化收益率

### 💧 流動性挖礦 (SimpleLiquidityPool)
- **雙幣提供**: 提供 TEST/TESTB 流動性
- **LP Token**: 獲得流動性提供者代幣
- **手續費分紅**: LP 持有者分享交易手續費
- **資產管理**: 查看和管理流動性資產

### 🎨 NFT 市場
- **NFT 鑄造**: 免費領取或付費鑄造 NFT
- **市場交易**: 完整的 NFT 上架、購買流程
- **轉移功能**: 支援 NFT 轉移操作
- **智能合約**: 基於 ERC-721 標準

## 🛠 技術架構

### 前端技術棧
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**: wagmi + viem + RainbowKit
- **State Management**: React Hooks + TanStack Query

### 區塊鏈技術棧
- **Development**: Hardhat
- **Language**: Solidity ^0.8.20
- **Standards**: ERC-20, ERC-721, OpenZeppelin
- **Network**: Sepolia Testnet
- **Testing**: Hardhat + Chai

### 智能合約架構
```
contracts/
├── TestToken.sol           # ERC-20 測試代幣
├── SimpleSwap.sol          # AMM 交換合約
├── SimpleStaking.sol       # 質押挖礦合約
├── SimpleLiquidityPool.sol # 流動性池合約
├── MyFirstNFT.sol         # ERC-721 NFT 合約
└── NFTMarketplace.sol     # NFT 市場合約
```

## 🚀 快速開始

### 環境要求
- Node.js >= 18.0.0
- npm 或 yarn 或 pnpm
- Git

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone https://github.com/your-username/MyFirstDapp.git
   cd MyFirstDapp
   ```

2. **安裝依賴**
   ```bash
   npm install
   # 或者
   yarn install
   # 或者
   pnpm install
   ```

3. **環境配置**
   ```bash
   cp .env.example .env
   ```
   
   編輯 `.env` 文件，添加必要的配置：
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```
   
   > 📝 獲取 WalletConnect Project ID: [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)

4. **啟動開發服務器**
   ```bash
   npm run dev
   ```
   
   打開 [http://localhost:3000](http://localhost:3000) 查看應用

## 🔧 開發指令

```bash
# 前端開發
npm run dev          # 啟動開發服務器
npm run build        # 構建生產版本
npm run start        # 啟動生產服務器
npm run lint         # 代碼檢查

# 智能合約開發
npm run compile      # 編譯合約
npm run test:contracts # 運行合約測試
npm run node         # 啟動本地 Hardhat 節點
npm run deploy:sepolia # 部署到 Sepolia 測試網
```

## 📁 專案結構

```
MyFirstDapp/
├── 📁 app/                    # Next.js App Router
│   ├── 📄 layout.tsx         # 根佈局
│   ├── 📄 page.tsx           # 首頁
│   ├── 📁 defi/              # DeFi 功能頁面
│   ├── 📁 nft/               # NFT 功能頁面
│   └── 📁 wallet/            # 錢包模擬頁面
├── 📁 components/             # React 共用組件
│   └── 📁 ui/                # shadcn/ui 組件
├── 📁 contracts/              # Solidity 智能合約
├── 📁 scripts/                # 部署和工具腳本
├── 📁 lib/                    # 工具函數和配置
│   ├── 📄 abi/               # 合約 ABI 文件
│   ├── 📄 contracts.ts       # 合約地址配置
│   └── 📄 wagmi.ts           # wagmi 配置
├── 📁 public/                 # 靜態資源
├── 📄 hardhat.config.js      # Hardhat 配置
├── 📄 package.json           # 項目依賴
└── 📄 README.md              # 項目文檔
```

## 🌐 部署的合約地址 (Sepolia Testnet)

| 合約名稱 | 地址 | 功能描述 |
|---------|------|----------|
| TestToken (TEST) | `0xc4417D80F2D8ca9FF51Df6277663E35Ab6E3bAff` | 主要測試代幣 |
| TestTokenB (TESTB) | `0xea58D8C226e5b9Dc3EcEA8fC1AAD4fE4dc02ff68` | 交換用測試代幣 |
| RewardToken (REWARD) | `0x1d54edb6f8975777cF7a9932c58D8e7d4d93F986` | 質押獎勵代幣 |
| SimpleSwap | `0x3806f5f10781fA47154De39E363791036c6cCf14` | 代幣交換合約 |
| SimpleStaking | `0x9C3A90611f2a4413F95ef70E43b8DbC06EEd1329` | 質押挖礦合約 |
| SimpleLiquidityPool | `0x64249720379Df33fE1195910EBade02D133899B3` | 流動性池合約 |
| MyFirstNFT | `0x2E9F25EC99f6A6ad7F07aDD221Ae3065FE2665c3` | NFT 合約 |

> 🔗 在 [Sepolia Etherscan](https://sepolia.etherscan.io/) 上查看合約詳情

## 🎯 使用指南

### 1. 連接錢包
- 點擊右上角「連接錢包」按鈕
- 選擇支援的錢包（MetaMask、WalletConnect 等）
- 確保錢包已切換到 Sepolia 測試網

### 2. 獲取測試代幣
- 前往「DeFi」頁面
- 使用代幣水龍頭領取免費的 TEST 和 TESTB 代幣
- 每個地址每天可領取 100 個代幣

### 3. 體驗 DeFi 功能
- **交換**: 在 TEST 和 TESTB 之間進行交換
- **質押**: 質押 TEST 代幣獲得 REWARD 獎勵
- **流動性**: 提供流動性獲得 LP 代幣和手續費分紅

### 4. NFT 體驗
- 前往「NFT」頁面
- 免費鑄造或付費鑄造 NFT
- 在市場上架、購買或轉移 NFT

## 🧪 測試

### 運行前端測試
```bash
npm test
```

### 運行智能合約測試
```bash
npm run test:contracts
```

### 測試覆蓋率
```bash
npx hardhat coverage
```

## 🤝 貢獻指南

我們歡迎社區貢獻！請遵循以下步驟：

1. Fork 此專案
2. 創建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

### 代碼規範
- 使用 TypeScript
- 遵循 ESLint 規則
- 為新功能添加測試
- 更新相關文檔

## 📄 License

此專案使用 MIT 許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 🆘 常見問題

### Q: 如何獲取 Sepolia 測試網的 ETH？
A: 您可以使用以下水龍頭：
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

### Q: 交易失敗怎麼辦？
A: 請檢查：
- 錢包是否連接到 Sepolia 測試網
- 是否有足夠的 ETH 支付 gas 費用
- 代幣餘額是否充足

### Q: 如何重置應用狀態？
A: 清除瀏覽器緩存或使用無痕模式重新訪問。

## 📞 聯繫我們

- **GitHub Issues**: [提交問題](https://github.com/your-username/MyFirstDapp/issues)
- **Email**: your-email@example.com
- **Twitter**: [@your-twitter](https://twitter.com/your-twitter)

## 🙏 致謝

感謝以下開源項目和社區：
- [Next.js](https://nextjs.org/) - React 框架
- [Hardhat](https://hardhat.org/) - 以太坊開發環境
- [wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [RainbowKit](https://www.rainbowkit.com/) - 錢包連接組件
- [shadcn/ui](https://ui.shadcn.com/) - UI 組件庫
- [OpenZeppelin](https://openzeppelin.com/) - 智能合約庫

---

⭐ 如果這個專案對您有幫助，請給我們一個 Star！