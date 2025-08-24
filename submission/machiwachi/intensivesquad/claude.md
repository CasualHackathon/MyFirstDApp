# 残酷小队 - 项目总结

## 项目概述

残酷学分是一个基于区块链的游戏化学习积分系统，将"残酷共学"活动积分上链，建立具有团队协作增益与退出惩罚机制的部落战斗系统。

## 技术栈

### 前端框架

- **Next.js 15.4.7** - React 全栈框架，使用 Turbo 模式优化构建
- **React 19.1.1** - 用户界面构建库
- **TypeScript** - 静态类型检查

### 样式系统

- **Tailwind CSS 4.1.12** - 原子化 CSS 框架
- **Tailwind Animate** - CSS 动画扩展
- **Class Variance Authority** - 组件变体管理
- **Tailwind Merge** - 类名合并工具

### UI 组件库

- **Radix UI** - 无样式的可访问性组件库
  - Dialog, Avatar, Badge, Button, Card, Input, Label, Select, Textarea 等
- **Lucide React** - 图标库
- **Sonner** - Toast 通知组件
- **Vaul** - 抽屉组件

### 区块链集成

- **RainbowKit 2.2.8** - 钱包连接 UI 工具包
- **Wagmi 2.16.4** - React Hooks for Ethereum
- **Viem 2.34.0** - TypeScript 以太坊接口

### 数据管理

- **TanStack React Query 5.85.3** - 服务器状态管理
- **React Hook Form 7.62.0** - 表单状态管理
- **Zod 4.0.17** - 运行时类型验证
- **Hono RPC** - 用于与后端交互的 RPC 接口

### 即将集成的技术栈

#### 数据库和 ORM

- **Drizzle ORM** - 用于数据库操作的轻量级 TypeScript ORM

#### API 路由

- **Hono** - 快速、轻量级的 Web 框架，用于构建 API 路由

#### 样式增强

- **Tailwind CSS** - 已集成，将继续作为主要样式解决方案

## 项目结构

```
intensivesquad/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局组件
│   └── page.tsx           # 首页组件
├── components/            # React 组件
│   ├── providers.tsx      # 应用提供者
│   ├── theme-provider.tsx # 主题提供者
│   └── ui/               # UI 组件库
├── lib/                  # 工具函数和配置
│   ├── utils.ts          # 通用工具函数
│   └── wagmi.ts          # Wagmi 配置
├── docs/                 # 项目文档
└── public/              # 静态资源
```

## 文档索引

要求：

- 每次实现一个功能，首先设计，将设计文档和执行进度用 markdown 格式存在 docs 文件夹。
- 读取[spec.md](/docs/spec.md)，以全面理解系统的目标和结构。

## 核心功能

### 已实现功能

1. **钱包连接** - 使用 RainbowKit 实现多钱包支持
2. **部落系统** - 部落创建、加入、排行榜
3. **游戏化积分** - STUDY 代币积分系统
4. **分红机制** - 部落分红池和奖励分配
5. **响应式 UI** - 像素风格的游戏化界面

### 技术特色

- **像素风格 UI** - 独特的游戏化视觉设计
- **实时状态管理** - 使用 React Query 进行服务器状态同步
- **类型安全** - 全面的 TypeScript 类型检查
- **可访问性** - 基于 Radix UI 的无障碍组件

## 开发命令

```bash
# 开发模式（Turbo 优化）
pnpm dev

# 生产构建（Turbo 优化）
pnpm build

# 代码检查
pnpm lint

# 启动生产服务器
pnpm start
```

## 下一步开发计划

1. **集成 Drizzle ORM**

   - 设计数据库模式
   - 实现用户、部落、积分等数据模型
   - 建立数据库迁移系统

2. **实现 Hono API 路由**

   - 设计 RESTful API 结构
   - 实现部落管理 API
   - 添加积分计算和分红逻辑

3. **扩展 Tailwind CSS 样式**
   - 完善像素风格组件样式
   - 优化响应式设计
   - 添加更多动画效果

## 部署信息

- **预览地址**: https://intensivesquad.vercel.app
- **代码仓库**: GitHub 私有仓库
- **部署平台**: Vercel
