# SIWE (Sign-In with Ethereum) 实现文档

## 概述

本项目已成功集成 RainbowKit 的 SIWE (Sign-In with Ethereum) 身份验证功能，允许用户使用以太坊钱包进行安全登录。

## 已实现的功能

### 🔐 核心认证流程

- **钱包连接**: 使用 RainbowKit 连接以太坊钱包
- **消息签名**: 用户签名验证消息以证明钱包所有权
- **会话管理**: 使用 NextAuth 管理用户会话
- **服务器验证**: 服务器端验证签名和会话有效性

### 📁 文件结构

```
app/
├── api/auth/[...nextauth]/route.ts     # NextAuth API 路由
├── auth-test/page.tsx                  # SIWE 测试页面
└── layout.tsx                          # 更新以支持会话

components/
└── providers.tsx                       # 更新以支持 SIWE

lib/
├── auth.ts                            # NextAuth 配置
└── wagmi.ts                           # Wagmi 配置

docs/
└── SIWE_IMPLEMENTATION.md             # 本文档
```

### 🛠️ 已安装的依赖包

```json
{
  "@rainbow-me/rainbowkit-siwe-next-auth": "^0.5.0",
  "next-auth": "^4.24.11",
  "siwe": "^3.0.0",
  "@next-auth/prisma-adapter": "^1.0.7"
}
```

## 使用方法

### 1. 访问测试页面

访问 `/auth-test` 页面来测试 SIWE 功能，或在主页点击 "🔐 测试 SIWE 身份验证" 链接。

### 2. 认证流程

1. 点击 "Connect Wallet" 连接钱包
2. 选择支持的钱包（MetaMask、WalletConnect 等）
3. 连接成功后，系统自动提示签名验证消息
4. 签名成功后获得认证会话

### 3. 在代码中使用会话

```tsx
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>加载中...</p>;
  if (!session) return <p>请先登录</p>;

  return (
    <div>
      <p>欢迎！地址: {session.address}</p>
    </div>
  );
}
```

### 4. 服务器端会话验证

```tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
```

## 配置

### 环境变量

需要在 `.env.local` 文件中设置以下环境变量：

```env
# NextAuth 配置
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# WalletConnect 项目 ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

### 自定义配置

#### 自定义 SIWE 消息

在 `components/providers.tsx` 中可以自定义签名消息：

```tsx
const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "登录到你的应用",
  domain: "your-domain.com",
});
```

#### 支持的区块链网络

在 `lib/wagmi.ts` 中配置支持的网络：

```tsx
import { mainnet, sepolia, polygon } from "wagmi/chains";

export const config = getDefaultConfig({
  // ...
  chains: [mainnet, sepolia, polygon],
});
```

## 安全特性

- ✅ **防重放攻击**: 使用 nonce 防止消息重放
- ✅ **域名验证**: 验证消息域名与当前网站匹配
- ✅ **签名验证**: 使用 ECDSA 验证钱包签名
- ✅ **会话安全**: JWT 令牌加密存储
- ✅ **自动过期**: 会话自动过期保护

## 技术栈

- **RainbowKit**: 钱包连接 UI 组件库
- **Wagmi**: 以太坊 React Hooks
- **NextAuth**: 身份验证框架
- **SIWE**: Sign-In with Ethereum 标准实现
- **Next.js 15**: App Router 支持

## 测试

1. 启动开发服务器: `pnpm dev`
2. 访问 `http://localhost:3000/auth-test`
3. 连接钱包并完成签名流程
4. 验证会话信息正确显示

## 下一步优化

- [ ] 添加数据库持久化用户会话
- [ ] 实现角色权限管理
- [ ] 添加多链支持
- [ ] 集成 ENS 域名解析
- [ ] 添加会话过期自动刷新

## 故障排除

### 常见问题

1. **签名失败**: 检查网络连接和钱包状态
2. **会话无效**: 检查 NEXTAUTH_SECRET 环境变量
3. **域名不匹配**: 确保 NEXTAUTH_URL 与当前域名一致

### 开发调试

在浏览器开发者工具的 Console 中可以查看详细的错误信息和认证流程日志。
