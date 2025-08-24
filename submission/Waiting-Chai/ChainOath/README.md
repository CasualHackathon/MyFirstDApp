# ChainOath: 去中心化链上誓约平台

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.21-blue.svg)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Foundry](https://img.shields.io/badge/Foundry-Latest-red.svg)](https://getfoundry.sh/)

**一个完全去中心化的链上承诺与激励平台**

[🚀 快速开始](#快速开始) • [📖 功能特性](#功能特性) • [🏗️ 技术架构](#技术架构) • [📋 API文档](#api文档) • [🔧 部署指南](#部署指南)

</div>

## 📖 项目简介

**ChainOath** 是一个基于以太坊区块链的去中心化誓约平台，通过智能合约技术实现承诺的创建、监督和奖励分配。平台采用创新的双角色机制（创建者+守约人），结合NFT成就系统和社交功能，为用户提供可信、透明、激励性的目标管理解决方案。

### 🎯 核心价值

- **🔒 去中心化信任**: 基于智能合约的自动化执行，无需第三方仲裁
- **💰 经济激励机制**: 通过代币质押和奖励分配，提高承诺履行率
- **🏆 成就NFT系统**: 将个人成就铸造为NFT，构建链上声誉体系
- **🌐 社交互动**: 支持点赞、评论等社交功能，增强社区参与度
- **📊 数据透明**: 所有数据上链，公开透明，可验证追溯

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.0.0
- **npm** 或 **yarn**
- **Foundry** (智能合约开发)
- **MetaMask** 或其他Web3钱包
- **Git**

### 安装与启动

```bash
# 1. 克隆项目
git clone https://github.com/your-username/ChainOath.git
cd ChainOath

# 2. 安装前端依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置网络和合约地址

# 4. 启动前端开发服务器
npm run dev

# 5. 在新终端中设置智能合约环境
cd contracts/foundry-contracts
forge install
forge test -vvv --via-ir
```

访问 `http://localhost:5173` 开始体验 ChainOath！

### 环境配置

创建 `.env` 文件并配置以下参数：

```bash
# 网络配置
VITE_NETWORK=sepolia  # mainnet | sepolia | localhost

# Sepolia 测试网合约地址
VITE_SEPOLIA_CONTRACT_ADDRESS=0x03c78D9cAB691B6E3c229e7c9cF685fE2189a124
VITE_SEPOLIA_NFT_CONTRACT_ADDRESS=0x28dBAf2A5f8B2a7ed1FF41DE066c7a1de9dFa7f6

# 主网合约地址（待部署）
VITE_MAINNET_CONTRACT_ADDRESS=
VITE_MAINNET_NFT_CONTRACT_ADDRESS=
```

## 🌟 功能特性

### 核心功能

#### 🎯 誓约管理
- **创建誓约**: 设置标题、描述、守约人、奖励金额、截止时间和检查点
- **角色分离**: 创建者（出资人）与守约人（执行人）分离，避免利益冲突
- **多代币支持**: 支持ETH、WETH、USDC、USDT、DAI等多种代币作为奖励
- **灵活期限**: 自定义截止时间，支持短期和长期目标
- **检查点系统**: 设置多个里程碑，便于进度跟踪

#### 💰 资金管理
- **智能托管**: 奖励资金自动托管在智能合约中
- **自动分配**: 根据评估结果自动分配资金给守约人或退还创建者
- **安全保障**: 采用ReentrancyGuard防重入攻击，Pausable紧急暂停机制
- **Gas优化**: 优化合约代码，降低交易成本

#### 🏆 NFT成就系统
- **多种成就类型**: 首次誓约、守约达人、可信创建者、社区之星等
- **自动铸造**: 达成条件后自动触发NFT铸造
- **稀有度系统**: 不同成就具有不同稀有度等级
- **元数据存储**: 成就信息和图片存储在IPFS上
- **声誉体系**: 基于NFT构建链上个人声誉

#### 🌐 社交功能
- **点赞系统**: 为优秀誓约点赞，增加曝光度
- **评论互动**: 支持多层级评论，促进社区交流
- **排行榜**: 展示热门誓约和活跃用户
- **个人主页**: 查看用户的所有誓约和成就

### 高级特性

#### 📊 数据分析
- **用户统计**: 总誓约数、完成率、获得点赞数等
- **平台数据**: 全平台誓约统计和趋势分析
- **成功率追踪**: 个人和平台整体成功率监控

#### 🔐 安全机制
- **多重验证**: 地址验证、金额验证、时间验证
- **权限控制**: 基于角色的访问控制
- **紧急机制**: 合约暂停和升级机制
- **审计安全**: 代码经过安全审计

## 🏗️ 技术架构

### 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用       │    │   智能合约       │    │   存储层         │
│                │    │                │    │                │
│ React + TS     │◄──►│ ChainOathSecure │◄──►│ Ethereum       │
│ Material-UI    │    │ ChainOathNFT   │    │ IPFS           │
│ ethers.js      │    │ Solidity 0.8.21│    │ 区块链存储      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技术栈

#### 前端技术
- **框架**: React 18.3.1 + TypeScript 5.5.3
- **构建工具**: Vite 5.4.1 (快速热重载)
- **UI组件**: Material-UI v7 (Grid v2 API)
- **路由**: React Router v6
- **状态管理**: React Hooks (useState, useEffect)
- **区块链交互**: ethers.js v6.15.0
- **样式**: Tailwind CSS + Emotion

#### 智能合约
- **语言**: Solidity 0.8.21
- **框架**: Foundry (测试、部署、验证)
- **标准**: ERC-20 (代币)、ERC-721 (NFT)
- **安全库**: OpenZeppelin Contracts
- **优化**: 启用优化器 (200 runs)，via-ir编译

#### 基础设施
- **网络**: Ethereum Mainnet / Sepolia Testnet
- **存储**: IPFS (元数据存储)
- **钱包**: MetaMask、WalletConnect
- **区块浏览器**: Etherscan

### 智能合约架构

#### 主合约 (ChainOathSecure)
```solidity
// 核心功能
- createOath()          // 创建誓约
- evaluateCompletion()  // 评估完成状态
- likeOath()           // 点赞功能
- addComment()         // 添加评论
- handleExpiredOath()  // 处理过期誓约

// 查询功能
- getOath()            // 获取誓约详情
- getAllOaths()        // 获取所有誓约
- getUserStats()       // 获取用户统计
```

#### NFT合约 (ChainOathNFT)
```solidity
// NFT功能
- mintAchievement()    // 铸造成就NFT
- hasAchievement()     // 检查成就状态
- getUserTokens()      // 获取用户NFT
- getAchievement()     // 获取成就信息
```

### 数据结构

#### 誓约结构 (Oath)
```typescript
interface Oath {
  id: number;              // 誓约ID
  title: string;           // 标题
  description: string;     // 描述
  creater: string;         // 创建者地址
  committer: string;       // 守约人地址
  tokenAddress: string;    // 代币合约地址
  amount: string;          // 奖励金额
  deadline: number;        // 截止时间
  checkpoints: string[];   // 检查点数组
  completionStatus: CompletionStatus; // 完成状态
  upvotes: number;         // 点赞数
  isActive: boolean;       // 是否激活
}
```

#### 成就类型 (AchievementType)
```typescript
enum AchievementType {
  FIRST_OATH = 0,      // 首次誓约
  OATH_KEEPER = 1,     // 守约达人
  TRUSTED_CREATER = 2, // 可信创建者
  COMMUNITY_STAR = 3,  // 社区之星
  MILESTONE_MASTER = 4,// 里程碑大师
  EARLY_ADOPTER = 5    // 早期采用者
}
```

## 📋 API文档

### 智能合约API

#### 创建誓约
```solidity
function createOath(
    string memory title,
    string memory description,
    address committer,
    address tokenAddress,
    uint256 amount,
    uint256 deadline,
    string[] memory checkpoints
) external returns (uint256 oathId)
```

#### 评估完成状态
```solidity
function evaluateCompletion(
    uint256 oathId,
    bool isCompleted,
    string memory feedback
) external
```

#### 获取誓约信息
```solidity
function getOath(uint256 oathId) external view returns (
    uint256 id,
    string memory title,
    string memory description,
    address creater,
    address committer,
    address tokenAddress,
    uint256 amount,
    uint256 createTime,
    uint256 deadline,
    string[] memory checkpoints,
    CompletionStatus completionStatus,
    uint256 upvotes,
    bool isActive
)
```

### 前端服务API

#### ContractService 主要方法

```typescript
// 初始化连接
await contractService.initialize();

// 创建誓约
const oathId = await contractService.createOath(
  title, description, committer, tokenAddress, 
  amount, deadline, checkpoints
);

// 评估完成
await contractService.evaluateCompletion(oathId, isCompleted, feedback);

// 获取誓约详情
const oath = await contractService.getOath(oathId);

// 获取用户统计
const stats = await contractService.getUserStats(userAddress);

// NFT相关
const hasAchievement = await contractService.hasAchievement(
  userAddress, AchievementType.FIRST_OATH
);
```

### 事件监听

```typescript
// 监听誓约创建
contractService.on('OathCreated', (oathId, creater, committer) => {
  console.log(`新誓约创建: ${oathId}`);
});

// 监听评估完成
contractService.on('OathEvaluated', (oathId, isCompleted, evaluator) => {
  console.log(`誓约 ${oathId} 评估完成: ${isCompleted}`);
});

// 监听NFT铸造
contractService.on('AchievementMinted', (user, achievementType, tokenId) => {
  console.log(`成就NFT铸造: ${achievementType} -> ${user}`);
});
```

## 🚀 部署指南

### 智能合约部署

#### 1. 环境准备
```bash
# 安装Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 进入合约目录
cd contracts/foundry-contracts

# 安装依赖
forge install
```

#### 2. 本地测试
```bash
# 编译合约
forge build

# 运行测试
forge test -vvv --via-ir

# 启动本地节点
anvil
```

#### 3. 测试网部署
```bash
# 设置环境变量
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export PRIVATE_KEY="your_private_key"
export ETHERSCAN_API_KEY="your_etherscan_key"

# 部署到Sepolia
forge script script/DeployAll.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
```

#### 4. 主网部署
```bash
# 设置主网环境变量
export MAINNET_RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY"

# 部署到主网
forge script script/DeployAll.s.sol --rpc-url $MAINNET_RPC_URL --broadcast --verify
```

### 前端部署

#### 1. 构建生产版本
```bash
# 安装依赖
npm install

# 构建
npm run build

# 预览
npm run preview
```

#### 2. Vercel部署
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

#### 3. 环境变量配置
在部署平台设置以下环境变量：
```bash
VITE_NETWORK=mainnet
VITE_MAINNET_CONTRACT_ADDRESS=0x...
VITE_MAINNET_NFT_CONTRACT_ADDRESS=0x...
```

## 📊 项目结构

```
ChainOath/
├── 📁 src/                          # 前端源码
│   ├── 📁 components/               # React组件
│   │   └── LikeRanking.tsx         # 点赞排行榜
│   ├── 📁 pages/                   # 页面组件
│   │   ├── Home.tsx                # 首页
│   │   ├── OathDetail.tsx          # 誓约详情
│   │   ├── MyOaths.tsx             # 我的誓约
│   │   └── Achievement.tsx         # 成就页面
│   ├── 📁 services/                # 服务层
│   │   ├── contractService.ts      # 合约服务
│   │   └── walletService.ts        # 钱包服务
│   ├── 📁 contracts/               # 合约配置
│   │   ├── ChainOathABI.ts         # 合约ABI
│   │   ├── ChainOathNFTABI.ts      # NFT合约ABI
│   │   └── config.ts               # 网络配置
│   ├── 📁 types/                   # 类型定义
│   │   ├── contract.ts             # 合约类型
│   │   ├── nft.ts                  # NFT类型
│   │   └── index.ts                # 统一导出
│   └── 📁 assets/                  # 静态资源
│       └── nft-images/             # NFT图片
├── 📁 contracts/                    # 智能合约
│   └── 📁 foundry-contracts/       # Foundry项目
│       ├── 📁 src/                 # 合约源码
│       │   ├── ChainOathSecure.sol # 主合约
│       │   ├── ChainOathNFT.sol    # NFT合约
│       │   └── WETH.sol            # WETH合约
│       ├── 📁 test/                # 合约测试
│       ├── 📁 script/              # 部署脚本
│       └── foundry.toml            # Foundry配置
├── 📁 public/                      # 公共资源
├── package.json                    # 前端依赖
├── vite.config.ts                  # Vite配置
├── tailwind.config.js              # Tailwind配置
└── README.md                       # 项目文档
```

## 🔧 开发指南

### 开发环境设置

1. **克隆项目**
```bash
git clone https://github.com/your-username/ChainOath.git
cd ChainOath
```

2. **安装依赖**
```bash
npm install
cd contracts/foundry-contracts
forge install
```

3. **启动开发服务器**
```bash
# 前端开发服务器
npm run dev

# 智能合约测试
forge test --watch
```

### 代码规范

- **TypeScript**: 使用严格模式，避免`any`类型
- **ESLint**: 遵循项目ESLint配置
- **Prettier**: 统一代码格式
- **Git Hooks**: 提交前自动检查代码质量

### 测试策略

#### 智能合约测试
```bash
# 运行所有测试
forge test -vvv

# 运行特定测试
forge test --match-test testCreateOath -vvv

# 生成覆盖率报告
forge coverage
```

#### 前端测试
```bash
# 单元测试
npm run test

# E2E测试
npm run test:e2e
```

### 性能优化

1. **智能合约优化**
   - 使用`via-ir`编译优化
   - 合理使用`view`和`pure`函数
   - 优化存储布局减少gas消耗

2. **前端优化**
   - 使用React.memo优化渲染
   - 实现虚拟滚动处理大量数据
   - 缓存合约查询结果

## 🌐 网络支持

### 当前支持的网络

| 网络 | Chain ID | 状态 | 合约地址 |
|------|----------|------|----------|
| **Sepolia Testnet** | 11155111 | ✅ 已部署 | [0x03c78D9...](https://sepolia.etherscan.io/address/0x03c78D9cAB691B6E3c229e7c9cF685fE2189a124) |
| **Ethereum Mainnet** | 1 | 🚧 待部署 | - |
| **Localhost** | 31337 | 🔧 开发环境 | 动态分配 |

### 合约地址

#### Sepolia 测试网
- **主合约**: `0x03c78D9cAB691B6E3c229e7c9cF685fE2189a124`
- **NFT合约**: `0x28dBAf2A5f8B2a7ed1FF41DE066c7a1de9dFa7f6`
- **WETH合约**: `0xdeE41a7bFA8b9d95050C0aEcFd91429f74063f90`

### 支持的代币

| 代币 | 符号 | Sepolia地址 | 主网地址 |
|------|------|-------------|----------|
| Ethereum | ETH | Native | Native |
| Wrapped Ether | WETH | `0xdeE41a7...` | `0xC02aaA3...` |
| USD Coin | USDC | `0x1c7D4B1...` | `0xA0b86a3...` |
| Tether USD | USDT | `0x7169D38...` | `0xdAC17F9...` |
| Dai Stablecoin | DAI | `0x3e62231...` | `0x6B17547...` |

## 🛡️ 安全考虑

### 智能合约安全

1. **重入攻击防护**: 使用OpenZeppelin的ReentrancyGuard
2. **权限控制**: 基于Ownable的访问控制
3. **紧急暂停**: Pausable机制应对紧急情况
4. **输入验证**: 严格的参数验证和边界检查
5. **溢出保护**: Solidity 0.8+内置溢出检查

### 前端安全

1. **输入验证**: 客户端和合约双重验证
2. **XSS防护**: 使用React的内置XSS保护
3. **HTTPS**: 强制使用HTTPS连接
4. **钱包安全**: 安全的钱包连接和交易签名

### 审计状态

- ✅ **代码审查**: 内部代码审查完成
- 🔄 **安全审计**: 第三方安全审计进行中
- 📋 **测试覆盖**: 智能合约测试覆盖率 > 90%

## 📈 路线图

### 已完成 ✅
- [x] 智能合约开发和部署
- [x] 前端应用开发
- [x] NFT成就系统
- [x] 社交功能（点赞、评论）
- [x] 多代币支持
- [x] Sepolia测试网部署

### 进行中 🚧
- [x] 主网部署准备
- [ ] 安全审计
- [ ] 性能优化
- [ ] 用户体验改进

### 计划中 📋
- [ ] Layer 2 支持 (Polygon, Arbitrum)
- [ ] 移动端应用
- [ ] DAO治理机制
- [ ] 跨链桥接
- [ ] AI辅助功能

### 案例：朋友间的健身/减肥对赌挑战

如果将 ChainOath 应用于朋友之间，最贴切的场景就是**将日常生活中的口头承诺或“打赌”变得更有趣、更有仪式感，并自动执行**。

这个场景的核心在于利用平台的机制来增加趣味性、减少扯皮，而不是解决陌生人之间的信任问题。

---

**背景:**
又到了一年一度立 Flag 的时候，张三和李四是好朋友，两人都想在新的一年里坚持健身。他们经常口头打赌，但最后总是不了了之。这次，他们决定用 ChainOath 来玩一次“正经”的对赌。

**角色:**
*   **创建者 (Creater):** 张三 (发起挑战的人)
*   **守约人 (Committer):** 李四 (接受挑战的人)

**使用 ChainOath 的流程:**

1.  **发起挑战誓约 (Creating the Oath):**
    *   张三登录 ChainOath，创建一个新的誓约。
    *   **标题:** “李四的腹肌挑战赛”
    *   **描述:** “我，张三，在此立誓约。如果李四能在未来两个月内，每周去健身房打卡至少3次，并坚持到最后，我将输给他 0.1 ETH 作为奖励。反之，这笔钱将退还给我。”
    *   **守约人:** 填入李四的钱包地址。
    *   **奖励金额:** 张三质押 `0.1 ETH` 到智能合约中。这笔钱现在不属于张三也不属于李四，而是由代码公平托管。
    *   **截止时间:** 60天后。
    *   **检查点 (Checkpoints):** 为了好玩和互相监督，他们可以设置一些检查点，例如：“每周日晚上需要在朋友圈或共同的聊天群里分享一张健身房的自拍照片。”

2.  **执行与社交互动:**
    *   张三在 ChainOath 页面上输入李四的钱包地址发起这个挑战后誓约正式生效。
    *   这个誓约对他们的共同好友是可见的。其他朋友可以在这个誓约下面**点赞**和**评论**：
        > 王五评论：“李四加油！我已经迫不及待想看张三输钱的样子了！😂”
        >
        > 赵六评论：“张三这招狠啊，看李四这次还怎么找借口。”
    *   这种社交互动极大地增强了李四的动力，也让整个过程充满了乐趣。他不仅仅是为了 0.1 ETH，更是为了在朋友面前挣得“面子”。

3.  **结果判定与自动结算:**
    *   **情况A：挑战成功**
        *   60天过去了，李四坚持完成了所有打卡。
        *   作为创建者和“裁判”，张三心服口服，他在 ChainOath 上将此誓约标记为 **“已完成”**。
        *   **智能合约自动执行:** 在收到“已完成”状态后，合约立刻将托管的 `0.1 ETH` 转账到李四的钱包。李四赢得了奖励和朋友们的喝彩。
    *   **情况B：挑战失败**
        *   李四在第三周就放弃了。
        *   60天截止日期一到，张三将誓约标记为 **“未完成”**。
        *   **智能合约自动执行:** 合约自动将 `0.1 ETH` **退还**给张三的钱包。张三赢回了他的钱，并获得了在朋友圈“嘲讽”李四的权利。

4.  **独特的链上纪念品:**
    *   如果李四挑战成功，李四在ChainOath上可以自己铸造一枚属于自己的 NFT。
    *   这枚 NFT 成为了他们这次友谊挑战的**永久数字纪念品**。几年后他们翻看钱包，还能看到这个有趣的记录，回忆起这段共同的经历。

### 为什么这个场景非常适合朋友之间：

*   **将口头约定升级:** 它把一个随意的口头打赌变成了一个有据可查、有仪式感的“链上契约”。
*   **增加趣味性和游戏性:** 点赞、评论和排行榜功能，让一个人的挑战变成了一群朋友的狂欢。
*   **自动化结算，避免尴尬:** 最大的亮点在于，钱由合约处理。挑战结束后，无论输赢，资金都会自动划转。这完美避免了“赢了钱不好意思要，输了钱假装忘记”的人情尴尬。
*   **公平透明:** 规则（金额、时间、目标）在一开始就白纸黑字（或者说，代码）写死了，谁也无法抵赖。
*   **创造独特的共同记忆:** NFT 成就系统为朋友间的互动提供了一个可以永久收藏和炫耀的“数字奖杯”。

---

<div align="center"> 

**🌟 如果这个项目对你有帮助，请给我们一个Star！**

[⭐ Star on GitHub](https://github.com/your-username/ChainOath) • [🐛 Report Bug](https://github.com/your-username/ChainOath/issues) • [💡 Request Feature](https://github.com/your-username/ChainOath/issues)

</div>
