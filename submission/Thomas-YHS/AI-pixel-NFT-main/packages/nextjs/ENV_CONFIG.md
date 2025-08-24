# 环境变量配置说明

## 必需与可选的环境变量

在 `packages/nextjs/` 目录下创建或更新 `.env.local` 文件，添加以下配置。下面列出了项目当前使用的变量及说明。

## 网络配置（新增）

- NEXT_PUBLIC_NETWORK (可选，默认: sepolia)
  - 用途：指定应用使用的网络环境
  - 可选值：`local`（本地开发）、`sepolia`（测试网）、`mainnet`（主网）
  - 影响：前端和API路由都会使用对应网络的配置

- NEXT_PUBLIC_RPC_URL (可选)
  - 用途：自定义RPC节点URL，优先级高于默认配置
  - 示例：`https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

- NEXT_PUBLIC_PINATA_JWT (可选/注意安全)
  - 用途：Pinata 的 JWT，用于服务器端 API 路由或直接通过前端访问 Pinata 网关时的认证。
  - 注意：任何以 `NEXT_PUBLIC_` 开头的变量都会被 Next.js 暴露到浏览器端。把敏感密钥放到 `NEXT_PUBLIC_` 前缀下会被公开，通常不推荐。推荐在服务器端 API 路由中使用未加 `NEXT_PUBLIC_` 的环境变量来保护密钥。

- NEXT_PUBLIC_GATEWAY_URL (必需用于前端访问)
  - 用途：Pinata 或其他 IPFS 网关的主机名，例如 `your-gateway.mypinata.cloud`。用于将 `ipfs://` 转换为 HTTP 网关 URL。
  - 以 `NEXT_PUBLIC_` 前缀存在则可在浏览器端使用。

- POE_API_KEY (可选/服务器端)
  - 用途：Poe（Retro-Diffusion）API 的秘钥，用于在服务器端调用 Poe 生成图像。
  - 放在服务器端（没有 NEXT_PUBLIC_ 前缀）以避免泄露给客户端。

- ALCHEMY_API_KEY (可选)
  - 用途：Alchemy 服务的 API key，用于与以太坊节点交互（例如 RPC URL 的一部分）。
  - 根据使用场景可放在服务器端或前端（若放到前端请注意流量/滥用风险）。

- ALCHEMY_NETWORK (可选)
  - 用途：指示要使用的网络，例如 `ETH_SEPOLIA`、`MAINNET` 等。由项目部署脚本或前端逻辑读取以决定 RPC 地址等。

## .env.local 示例

请在 `packages/nextjs/.env.local` 中填入类似下面的内容（将占位符替换为你的真实值）：

```env
# 网络配置（新增）
NEXT_PUBLIC_NETWORK=sepolia  # 可选值: local, sepolia, mainnet
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Pinata JWT（一般建议在服务器端 API 使用非 NEXT_PUBLIC 版本）
NEXT_PUBLIC_PINATA_JWT="your_pinata_jwt_here"

# Pinata 公共网关主机名（用于将 ipfs:// 转为 https://.../ipfs/<cid>）
NEXT_PUBLIC_GATEWAY_URL=your-gateway.mypinata.cloud

# Poe API Key（服务器端使用）
POE_API_KEY=your_poe_api_key_here

# Alchemy（用于链交互）
ALCHEMY_API_KEY=your_alchemy_key_here
ALCHEMY_NETWORK=ETH_SEPOLIA

# 钱包连接配置
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

## 安全建议

1. 将真正敏感的密钥（例如 Pinata 的写权限 JWT、Poe 的 API Key）放在服务器端使用，不要把写权限密钥暴露到客户端。若必须在前端使用，请仅使用最小权限或只使用网关/只读型 token。
2. 重启开发服务器以使 `.env.local` 生效（`yarn dev`）。
3. 不要把 `.env.local` 提交到版本控制（默认 `.gitignore` 应排除它）。

## 诊断与排查

- 如果调用第三方 API 失败，请先检查对应环境变量是否存在且拼写正确。
- 若前端无法访问某个网关 URL，尝试在本地终端使用 `curl` 或在浏览器中直接打开网关地址以排查网络或 CORS 问题。

以上说明覆盖了当前项目中使用到的环境变量。
