# GEN-3D-ASSETS

> AI-Powered 3D Asset NFT Platform - Transform Ideas into On-Chain Digital Assets
>
> 🌐 **在线演示**: [https://gen-3d-assets.vercel.app](https://gen-3-d-assests-web.vercel.app/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-red.svg)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)](https://reactjs.org/)
[![Foundry](https://img.shields.io/badge/Foundry-latest-brightgreen.svg)](https://getfoundry.sh/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.85-orange.svg)](https://tanstack.com/query)

## 🌟 项目概述

GEN-3D-ASSETS 是一个基于 AI 的 3D 资产 NFT 平台，用户可以通过文本提示使用 Meshy AI 生成个性化的 3D 模型，并将其作为 NFT 铸造到区块链上。平台支持 3D 模型可视化、交易和下载，构建了一个完整的数字资产生态系统。

### 🚀 演示专用一键脚本

在node22+及pnpm10+环境下**根目录**执行以下命令：

```
pnpm pre
```

### 🎯 核心功能

- **🤖 AI 生成**: 使用先进的 Meshy AI API 进行文本到 3D 转换
- **🖼️ 3D 可视化**: 基于 React Three Fiber 的交互式 3D 查看器
- **⛓️ NFT 铸造**: 智能合约管理的数字资产所有权
- **💰 交易市场**: 内置 NFT 交易和拍卖系统
- **📦 多格式支持**: 支持 OBJ、GLTF 等多种 3D 格式下载
- **🎨 个性化定制**: 基于用户偏好生成独特的数字资产
- **🔒 安全交易**: 自动版税分配和安全交易机制
- **📱 响应式设计**: 优化的移动端和桌面端体验

## 🏗️ 技术架构

### 技术栈

| 层级           | 技术                                         | 用途                            |
| -------------- | -------------------------------------------- | ------------------------------- |
| **智能合约**   | Foundry + Solidity 0.8.20 + OpenZeppelin     | NFT 管理、市场交易、版税分配    |
| **前端应用**   | Next.js 15.4.6 + TypeScript 5.0 + App Router | 现代 React 应用，支持服务端渲染 |
| **3D 渲染**    | React Three Fiber + Three.js + Drei          | 3D 模型展示和交互               |
| **区块链集成** | Wagmi v2.16 + Viem v2.33 + ConnectKit        | 钱包连接和合约交互              |
| **状态管理**   | Zustand 5.0 + TanStack Query v5.85           | 应用状态和服务器数据管理        |
| **UI 组件**    | TailwindCSS 4 + shadcn/ui + Radix UI         | 组件库和设计系统                |
| **文件存储**   | IPFS + Pinata v2.4                           | 去中心化文件存储                |
| **AI 集成**    | Meshy API                                    | 文本到 3D 模型生成              |
| **部署**       | Vercel + GitHub Actions                      | 自动化部署和 CI/CD              |

### 系统架构流程

```
用户输入 → Meshy AI API → 3D 模型生成 → IPFS 存储 → 智能合约铸造 → 前端展示 → 交易/下载
```

## 🚀 快速开始

### 环境要求

- Node.js 22+ 和 pnpm 10+
- Foundry 工具链
- Git 版本控制

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/your-username/GEN-3D-ASSETS.git
cd GEN-3D-ASSETS

# 安装依赖
pnpm install

# 安装 Foundry (macOS/Linux)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 环境配置

```bash
# 复制环境模板
cp web/.env.example web/.env.local
cp contracts/.env.example contracts/.env

# 配置环境变量
# web/.env.local
MESHY_API_KEY=your_meshy_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET=your_pinata_secret

# contracts/.env
PRIVATE_KEY=your_wallet_private_key
RPC_URL=your_rpc_url
```

### 开发调试

```bash
# 编译智能合约
pnpm run build:contracts

# 启动开发服务器
pnpm run dev

# 运行测试
pnpm run test
pnpm run test:contracts
```

访问 `http://localhost:3000` 查看应用。

示例 Generate Model prompt:

```
A full-body humanoid combat robot in a dynamic kneeling pose, one hand resting on its knee, the other holding a rifle. Design features: mechanical exposed joints, hydraulic pistons on the legs, armored plates on the chest and shoulders, a detailed head with a single visor-like optic sensor, and power cables snaking from its back to its torso. Model must be watertight and have good topology for animation.
```

示例 Generate Texture prompt:

```
PBR texture, photorealistic, cyberpunk mech. Main armor is matte military green with scratched paint revealing dark gray metal underneath. Silver polished metal for the internal mechanics and pistons. The visor glows with a bright neon orange light. Grease stains around joints, oil streaks on metal parts, and dirt dust accumulated on feet and lower legs. Dramatic rim lighting, studio render, 8k.
```

经preiview生成Model后才可选择refine精炼模型。

## 📁 项目结构

```
GEN-3D-ASSETS/
├── contracts/                    # Foundry 智能合约项目
│   ├── src/
│   │   ├── Asset3DNFT.sol       # 主 NFT 合约 (ERC-721 + 扩展)
│   │   ├── interfaces/          # 合约接口
│   │   └── libraries/           # 共享库
│   ├── test/                    # 合约测试
│   ├── script/                  # 部署脚本
│   └── foundry.toml            # Foundry 配置
├── web/                         # Next.js 前端应用
│   ├── src/
│   │   ├── app/                # App Router 页面
│   │   │   ├── generate/       # 3D 资产生成
│   │   │   ├── marketplace/    # NFT 市场
│   │   │   ├── nft/           # NFT 管理
│   │   │   └── profile/       # 用户资料
│   │   ├── components/
│   │   │   ├── 3d/            # 3D 可视化组件
│   │   │   ├── ui/            # 可复用 UI 组件
│   │   │   ├── web3/          # 区块链集成
│   │   │   └── layout/        # 布局组件
│   │   ├── hooks/             # 自定义 React Hooks
│   │   ├── lib/               # 工具和配置
│   │   └── store/             # 状态管理
│   └── package.json
├── docs/                        # 项目文档
├── .github/                     # GitHub Actions 工作流
├── pnpm-workspace.yaml         # PNPM 工作空间配置
└── README.md
```

## 🎮 使用指南

### 1. 连接钱包

点击首页的"连接钱包"按钮。通过 ConnectKit 支持 MetaMask、WalletConnect 等主流钱包。

### 2. 生成 3D 资产

- 导航到"生成"页面
- 输入描述性提示词（例如："一只未来主义的蓝色龙"）
- 等待 AI 生成 3D 模型
- 预览并确认模型质量

### 3. 铸造 NFT

- 选择满意的 3D 模型
- 设置资产信息（名称、描述、版税比例）
- 支付 Gas 费用完成链上铸造
- 获得独特的 NFT 所有权

### 4. 查看和交易

- 在"画廊"中浏览所有 3D 资产
- 查看详细的 3D 模型信息
- 在"市场"中交易 NFT
- 下载拥有的 3D 模型文件

## 🔧 开发脚本

```bash
# 开发
pnpm run dev                     # 启动前端开发服务器
pnpm run dev --filter web       # 仅启动 web 应用

# 构建
pnpm run build                   # 构建所有项目
pnpm run build:contracts        # 编译智能合约

# 测试
pnpm run test                    # 运行所有测试
pnpm run test:contracts         # 运行合约测试

# 代码质量
pnpm run lint                    # ESLint 检查
pnpm run format                  # 代码格式化
pnpm run lint:staged           # 预提交检查

# 部署
forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

## 📜 智能合约

### Asset3DNFT.sol 特性

#### 核心 NFT 功能 (ERC-721)

- ✅ NFT 铸造和管理
- ✅ IPFS 集成的元数据存储
- ✅ 版税机制 (EIP-2981)
- ✅ 基于角色的访问控制
- ✅ 批量铸造支持

#### 高级功能

- ✅ 资产升级系统（预览→精细模式）
- ✅ 纹理 URL 管理
- ✅ 创作者资产追踪
- ✅ Meshy 任务 ID 集成
- ✅ 紧急暂停合约控制

#### 安全功能

- ✅ ReentrancyGuard 保护
- ✅ 基于角色的访问控制
- ✅ 输入验证和元数据验证
- ✅ 紧急暂停功能

## 🔐 安全考虑

- ✅ API 密钥服务端保护
- ✅ 输入验证和文件验证
- ✅ 重入攻击防护
- ✅ 访问控制和权限管理
- ✅ 频率限制和使用控制
- ✅ 与 Pinata 的安全 IPFS 集成

## 📊 性能优化

- ✅ 3D 模型细节层次 (LOD)
- ✅ 懒加载和预加载策略
- ✅ 使用 Pinata 的 IPFS CDN 加速
- ✅ Next.js 图像和资产优化
- ✅ TanStack Query 智能缓存策略
- ✅ 渐进式 Web 应用 (PWA) 支持

## 🛣️ 发展路线图

### v1.0 - MVP ✅

- [x] 技术选型和架构设计
- [x] 智能合约开发 (Asset3DNFT)
- [x] 基础 3D 生成和展示
- [x] NFT 铸造功能
- [x] 简单市场界面

### v1.1 - 功能增强 🚧

- [x] UI 优化和钱包连接重构
- [x] 页面性能优化
- [ ] 批量生成和铸造
- [ ] 高级搜索和过滤
- [ ] 移动端优化
- [ ] 多语言支持

### v2.0 - 平台扩展 📋

- [ ] 公共 API 平台
- [ ] 插件生态系统
- [ ] Layer 2 集成
- [ ] 跨链支持

## 🤝 贡献指南

我们欢迎贡献！请查看我们的[贡献指南](./CONTRIBUTING.md)了解详情。

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`pnpm commit`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源许可

本项目基于 MIT 许可证开源 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 📞 支持与联系

- 📧 邮箱: zwjhb12@163.com
- 🐛 问题反馈: [GitHub Issues](https://github.com/your-username/GEN-3D-ASSETS/issues)

## 📈 最新更新

### v1.1.0 (2024-12-23)

- ✅ 优化 UI 界面和用户体验
- ✅ 重构钱包连接组件，修复 MetaMask 连接问题
- ✅ 页面性能优化和组件结构改进
- ✅ 更新依赖版本和安全修复

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！

**Made with ❤️ by the GEN-3D-ASSETS team**
