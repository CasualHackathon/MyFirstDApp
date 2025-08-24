# 残酷小队

2025 休闲黑客松参赛作品
[预览地址](https://intensivesquad.vercel.app)

## 我们在做什么（一句话）

残酷学分：把"残酷共学"的活动积分上链，做成有团队协作增益与退出惩罚的游戏化积分系统。

## 项目结构

这是一个使用 pnpm workspace 的 monorepo 项目：

```
intensivesquad/
├── packages/
│   ├── contracts/     # 智能合约项目
│   │   ├── contracts/ # Solidity 合约文件
│   │   ├── test/      # 合约测试
│   │   └── scripts/   # 部署脚本
│   └── webapps/       # Next.js 前端应用
│       ├── app/       # Next.js App Router
│       ├── components/ # React 组件
│       └── lib/       # 工具库
├── docs/              # 项目文档
└── package.json       # 根目录配置
```

## 文档

[设计文档](https://hackmd.io/@h_oI-bBpTxKWqPlaZTQ1Lw/rJXoW_eFeg)

## 开始开发

### Fork

1. Fork 一份代码到你的代码库
2. 改好之后，在 `https://github.com/machiwachi/intensivesquad` 创建 Pull Request
3. base 选 main 就好
4. 群里叫 @wachi

### Web 应用开发

```
$ git clone git@github.com:machiwachi/intensivesquad.git
$ cd intensivesquad
$ pnpm i
$ pnpm start
```

### 智能合约开发

```bash
# 进入合约目录
cd packages/contracts

# 编译合约
pnpm hardhat build

# 运行测试
pnpm hardhat test

# 运行本地节点
pnpm hardhat node

# 部署合约
pnpm hardhat run scripts/deploy.ts --network localhost
```

## 团队

| 角色       | id          |
| ---------- | ----------- |
| 前端       | @RowanWang6 |
| 前端       |             |
| 后端       |             |
| 后端       |             |
| 合约       |             |
| 合约       |             |
| 宣讲、设计 |             |
| 队长       | @machiwachi |


协议
---
2025-09-01 前是 MIT，之后为 CC0。

本项目初衷是参加一个自娱自乐的Hackthon的，赛友们别直接拷贝代码然后打败我们就好。之后就无所谓啦。
