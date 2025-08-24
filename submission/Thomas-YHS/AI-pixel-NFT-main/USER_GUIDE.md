# 🌤️ AI Moment NFT - 用户指南

## 📖 项目简介

**AI Moment NFT** 是一个基于区块链技术的创新项目，它将实时天气数据、地理位置信息和AI图像生成技术相结合，为用户创建独特的数字纪念品。每个NFT都记录了一个"此地此刻"的珍贵瞬间，具有不可替代性和收藏价值。

### 🎯 核心特色

- **🌍 实时天气驱动**: 基于用户所在位置的实时天气数据生成内容
- **🎨 AI智能生成**: 使用先进的AI技术自动生成风格化海报
- **💎 区块链铸造**: 基于ERC-721标准的NFT，确保唯一性和所有权
- **🚫 防重复机制**: 每个地址每天每个城市只能铸造一枚NFT
- **🎭 个性化边框**: 根据用户钱包特征自动生成个性化边框

## 🏗️ 技术架构

### 前端技术栈

- **Next.js 14**: 现代化的React框架，支持App Router
- **Tailwind CSS**: 实用优先的CSS框架
- **RainbowKit**: 钱包连接组件库
- **Wagmi**: React Hooks for Ethereum

### 智能合约

- **Solidity**: 以太坊智能合约开发语言
- **Foundry**: 现代化的智能合约开发框架
- **OpenZeppelin**: 安全可靠的智能合约库

### 后端服务

- **OpenAI API**: AI图像生成服务
- **Open-Meteo API**: 免费天气数据服务
- **Pinata IPFS**: 去中心化存储服务
- **Nominatim**: 地理编码服务

## 🚀 快速开始

### 环境要求

- Node.js >= v20.18.3
- Yarn 包管理器
- Git 版本控制

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd AI-pixel-NFT
```

2. **安装依赖**

```bash
yarn install
```

3. **启动本地区块链网络**

```bash
yarn chain
```

4. **部署智能合约**

```bash
yarn deploy
```

5. **启动前端应用**

```bash
yarn start
```

6. **访问应用**
打开浏览器访问 `http://localhost:3000`

## 📱 使用指南

### 1. 连接钱包

- 点击页面右上角的"连接钱包"按钮
- 选择你喜欢的钱包（MetaMask、WalletConnect等）
- 确保钱包已连接到Sepolia测试网

### 2. 创建天气NFT

#### 步骤1: 选择位置

- 在"城市名称"输入框中输入城市名称（如：北京、上海、深圳）
- 或者点击📍按钮使用当前位置

#### 步骤2: 获取天气数据

- 系统自动获取该城市的实时天气信息
- 显示温度、湿度、风速、天气状况等数据

#### 步骤3: AI生成图片

- 系统根据天气数据自动生成AI提示词
- 调用AI服务生成独特的天气海报

#### 步骤4: 上传到IPFS

- 自动将生成的图片和元数据上传到Pinata IPFS
- 获得去中心化存储的链接

#### 步骤5: 铸造NFT

- 调用智能合约铸造NFT
- 获得唯一的Token ID和区块链记录

### 3. 查看我的NFT

- 点击"我的收藏"查看已拥有的NFT
- 每个NFT显示城市、日期、天气等详细信息
- 支持查看NFT元数据和IPFS链接

## 🔧 高级功能

### 个性化边框设置

- **自动选择**: 系统根据钱包特征自动选择边框风格
- **简约风格**: 简洁优雅的渐变边框
- **像素风格**: 复古像素风格边框

### 钱包特征分析

系统会自动分析用户钱包的以下特征：

- 交易次数
- 钱包年龄
- NFT持有数量
- 交互合约数量
- 链上标签

### 防重复铸造机制

- 每个地址每天每个城市只能铸造一枚NFT
- 实时合约校验，防止重复铸造
- 保护AI资源，避免无效请求

## 🌐 网络配置

### 测试网部署

- **Sepolia测试网**: 主要的测试环境
- **合约地址**: 部署后自动更新
- **RPC节点**: 支持自定义RPC配置

### 环境变量配置

```bash
# .env.local
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_RPC_URL=your_custom_rpc
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_id
POE_API_KEY=your_poe_api_key
```

## 📊 智能合约详情

### WeatherNFT合约

- **标准**: ERC-721
- **功能**: 铸造、查询、所有权管理
- **数据结构**: 城市、日期、天气、温度、时间段等

### 主要函数

- `mintWithURI()`: 铸造新的天气NFT
- `getWeatherData()`: 获取NFT的天气数据
- `hasAlreadyMinted()`: 检查是否已铸造
- `getOwnedTokens()`: 获取用户拥有的NFT列表

## 🎨 AI生成特性

### 图像生成模型

- **Retro-Diffusion-Core**: 像素风格图像生成
- **尺寸**: 384x384像素
- **风格**: 旅行海报风格，现代排版

### 提示词生成

系统根据以下信息自动生成AI提示词：

- 城市名称
- 天气状况
- 温度
- 时间段
- 艺术风格要求

## 🔒 安全特性

### 智能合约安全

- 使用OpenZeppelin标准库
- 防重复铸造机制
- 所有权控制
- 事件记录

### 前端安全

- 钱包连接验证
- 输入数据验证
- API请求限制
- 错误处理机制

## 🚨 常见问题

### Q: 为什么无法铸造NFT？

A: 可能的原因：

- 钱包未连接
- 不在支持的网络上
- 今日已铸造过该城市的NFT
- 网络连接问题

### Q: AI生成失败怎么办？

A: 系统会自动使用备用图像生成方案，确保流程继续进行。

### Q: 如何查看NFT元数据？

A: 在"我的收藏"页面点击NFT卡片，可以查看详细信息和IPFS链接。

### Q: 支持哪些钱包？

A: 支持所有兼容WalletConnect的钱包，包括MetaMask、Rainbow、Trust Wallet等。

## 🤝 贡献指南

### 开发环境设置

1. Fork项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建Pull Request

### 代码规范

- 使用TypeScript
- 遵循ESLint规则
- 编写单元测试
- 添加适当的注释

## 📄 许可证

本项目基于MIT许可证开源，详见LICENSE文件。

## 🔗 相关链接

- [项目主页](http://localhost:3000)
- [智能合约](packages/foundry/contracts/)
- [前端代码](packages/nextjs/)
- [API文档](packages/nextjs/app/api/)

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 提交GitHub Issue
- 发送邮件至项目维护者
- 参与社区讨论

---

**🌤️ AI Moment NFT** - 记录每一个珍贵的天气瞬间，创造独特的数字记忆。
