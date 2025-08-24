# 课程管理系统

一个基于 React + TypeScript + Viem 的现代化课程管理平台，支持课程展示、积分系统、钱包连接等功能。

## 🚀 功能特性

### 📚 课程管理

- **课程展示**: 精美的课程卡片展示，包含图片、标题、描述、积分等信息
- **分类筛选**: 支持按课程分类进行筛选（体育健身、数学、语言学习等）
- **搜索功能**: 支持按课程名称、描述、讲师进行搜索
- **排序功能**: 支持按评分、积分、点赞数进行排序

### 💎 积分系统

- **积分显示**: 实时显示用户积分余额
- **积分消费**: 报名课程时自动扣除相应积分
- **积分验证**: 报名前检查积分是否充足

### 🔗 钱包集成

- **钱包连接**: 支持 MetaMask、Coinbase Wallet 等主流钱包
- **网络切换**: 支持主网、测试网切换
- **账户管理**: 显示当前连接的钱包地址和网络信息

### 🎨 用户界面

- **响应式设计**: 适配不同屏幕尺寸
- **现代化 UI**: 使用卡片式布局和优雅的动画效果
- **交互反馈**: 悬停效果、点击反馈等

## 📁 项目结构

```
src/
├── components/           # React 组件
│   ├── CourseCard.tsx   # 课程卡片组件
│   ├── CourseList.tsx   # 课程列表页面
│   └── WalletConnect.tsx # 钱包连接组件
├── data/                # 数据文件
│   └── mockCourses.ts   # 模拟课程数据
├── lib/                 # 工具库
│   ├── database.ts      # 数据库配置
│   └── ethClient.ts     # 以太坊客户端
├── types/               # TypeScript 类型定义
│   ├── course.ts        # 课程相关类型
│   └── global.d.ts      # 全局类型声明
├── App.tsx              # 主应用组件
└── main.tsx             # 应用入口
```

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 4
- **区块链**: Viem (以太坊交互)
- **样式**: CSS-in-JS (内联样式)
- **数据库**: 模拟数据库 (可扩展为 SQLite)

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 访问应用

打开浏览器访问 http://localhost:3000

## 📊 数据结构

### 课程 (Course)

```typescript
interface Course {
  id: string; // 课程ID
  title: string; // 课程标题
  description: string; // 课程描述
  points: number; // 课程积分
  duration: string; // 课程时长
  rating: number; // 评分 (1-5)
  likes: number; // 点赞数
  imageUrl?: string; // 课程图片
  category: string; // 课程分类
  instructor: string; // 讲师
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}
```

### 课程分类 (CourseCategory)

```typescript
interface CourseCategory {
  id: string; // 分类ID
  name: string; // 分类名称
  description: string; // 分类描述
  icon: string; // 分类图标
}
```

## 🔧 配置说明

### 钱包配置

在 `src/lib/ethClient.ts` 中配置以太坊网络和账户信息。

### 数据库配置

当前使用模拟数据库，在 `src/lib/database.ts` 中可以扩展为真实的 SQLite 数据库。

## 🎯 后续扩展

### 数据库集成

1. 安装 SQLite 相关依赖
2. 创建数据库表结构
3. 实现真实的数据库操作

### 后端 API

1. 创建 RESTful API
2. 实现用户认证
3. 添加课程管理接口

### 区块链功能

1. 积分代币合约
2. 课程 NFT
3. 去中心化存储

## 📝 开发说明

### 添加新课程

在 `src/data/mockCourses.ts` 中添加新的课程数据。

### 修改样式

在对应组件中修改内联样式或创建 CSS 文件。

### 扩展功能

在 `src/components/` 目录下创建新的组件。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。
