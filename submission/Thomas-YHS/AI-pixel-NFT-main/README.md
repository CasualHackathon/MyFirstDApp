# 🌤️ AI Moment NFT

🧪 **AI Moment NFT** 是一个创新的去中心化应用，结合实时天气数据、地理位置信息和AI图像生成技术，为用户创建独特的"此地此刻"数字纪念NFT。

⚙️ 基于 **Scaffold-ETH 2** 构建，使用 NextJS、RainbowKit、Foundry、Wagmi、Viem 和 TypeScript 技术栈。

## ✨ 核心特色

- 🌍 **实时天气驱动**: 基于用户所在位置与实时天气数据，保证每张图都是独一无二的时空片段
- 🎨 **AI 智能生成**: 使用最新AI技术自动生成风格化海报，每一张都是艺术品
- 💎 **NFT 铸造**: ERC-721标准，每天每地限量1枚，保证稀缺性和收藏价值
- 🔥 **防重复机制**: 智能合约防止同一地址在同一城市同一天重复铸造
- 📱 **响应式设计**: 支持移动端和桌面端，提供流畅的用户体验
- 🔐 **多钱包支持**: 集成RainbowKit，支持多种钱包连接方式

## 🏗️ 技术架构

### 智能合约

- **WeatherNFT.sol**: 核心NFT合约，基于OpenZeppelin标准
- **ERC-721**: 标准NFT代币实现
- **Foundry**: 智能合约开发和测试框架

### 前端应用

- **Next.js 15**: React框架，支持App Router
- **Tailwind CSS**: 现代化CSS框架
- **DaisyUI**: 组件库，提供美观的UI组件
- **RainbowKit**: Web3钱包连接解决方案

### 外部服务集成

- **OpenAI API**: AI图像生成
- **Pinata**: IPFS文件存储
- **OpenWeatherMap**: 实时天气数据

## 🚀 快速开始

### 环境要求

- [Node.js (>= v20.18.3)](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Git](https://git-scm.com/downloads)

### 安装和运行

1. **克隆项目并安装依赖**

```bash
git clone <your-repo-url>
cd AI-pixel-NFT
yarn install
```

2. **启动本地区块链网络**

```bash
yarn chain
```

3. **部署智能合约**

```bash
yarn deploy
```

4. **启动前端应用**

```bash
yarn start
```

5. **访问应用**
打开浏览器访问: `http://localhost:3000`

## 📖 使用指南

### 创建NFT流程

1. **连接钱包**: 使用MetaMask或其他支持的钱包连接
2. **选择城市**: 输入城市名称或使用GPS定位
3. **获取天气**: 系统自动获取当前天气数据
4. **AI生成**: 基于天气和地理位置生成独特海报
5. **铸造NFT**: 确认信息后铸造到区块链

### 功能页面

- **首页** (`/`): 项目介绍和功能概览
- **创建** (`/create`): 创建新的天气NFT
- **我的收藏** (`/me`): 查看已拥有的NFT
- **调试** (`/debug`): 智能合约交互界面

## 🔧 开发指南

### 项目结构

```
AI-pixel-NFT/
├── packages/
│   ├── foundry/           # 智能合约
│   │   ├── contracts/     # Solidity合约
│   │   ├── script/        # 部署脚本
│   │   └── test/          # 合约测试
│   └── nextjs/            # 前端应用
│       ├── app/           # Next.js页面
│       ├── components/    # React组件
│       ├── hooks/         # 自定义Hooks
│       └── lib/           # 工具库
```

### 智能合约开发

- 合约位置: `packages/foundry/contracts/WeatherNFT.sol`
- 测试: `yarn foundry:test`
- 部署: `yarn deploy`

### 前端开发

- 主页面: `packages/nextjs/app/page.tsx`
- 创建页面: `packages/nextjs/app/create/page.tsx`
- 样式: `packages/nextjs/styles/globals.css`

### 环境配置

创建 `.env.local` 文件并配置以下环境变量:

```bash
# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Pinata IPFS
PINATA_JWT=your_pinata_jwt

# 天气API (可选)
OPENWEATHER_API_KEY=your_openweather_api_key

# Alchemy (用于主网部署)
ALCHEMY_API_KEY=your_alchemy_api_key
```

## 🧪 测试

### 智能合约测试

```bash
yarn foundry:test
```

### 前端测试

```bash
cd packages/nextjs
yarn test
```

## 🚀 部署

### 本地测试网络

```bash
yarn chain      # 启动本地网络
yarn deploy     # 部署合约
yarn start      # 启动前端
```

### 主网部署

```bash
# 配置目标网络
yarn deploy --network sepolia  # 测试网
yarn deploy --network mainnet  # 主网

# 部署前端
yarn vercel     # Vercel部署
yarn ipfs       # IPFS部署
```

## 📚 API 文档

### 智能合约函数

- `mintWithURI()`: 铸造NFT
- `weatherData()`: 查询NFT天气数据
- `mintedCombinations()`: 检查铸造资格

### 前端Hooks

- `useScaffoldReadContract`: 读取合约数据
- `useScaffoldWriteContract`: 写入合约数据
- `useScaffoldEventHistory`: 监听合约事件

## 🤝 贡献指南

我们欢迎社区贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细指南。

### 贡献方式

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENCE) 文件了解详情。

## 🙏 致谢

- [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2) - 优秀的以太坊开发框架
- [OpenZeppelin](https://openzeppelin.com/) - 安全的智能合约库
- [OpenAI](https://openai.com/) - AI图像生成服务
- [Pinata](https://pinata.cloud/) - IPFS文件存储服务

## 📞 联系我们

- 项目地址: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 社区讨论: [Discord/Telegram]

## 📚 详细文档

- **[🚀 快速入门](QUICK_START.md)** - 5分钟快速上手指南
- **[📖 完整用户指南](USER_GUIDE.md)** - 详细的功能介绍和使用说明  
- **[🏗️ 技术架构](ARCHITECTURE.md)** - 系统架构和技术实现详解

---

<div align="center">
  <p>用AI记录每一个独特的时刻 🌤️</p>
  <p>Built with ❤️ using Scaffold-ETH 2</p>
</div>
