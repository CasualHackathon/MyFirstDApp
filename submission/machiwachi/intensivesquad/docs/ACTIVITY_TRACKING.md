# 活动追踪系统实现

## 概述

本文档描述了为残酷学分系统实现的活动追踪功能，使用 Redis 存储活动流数据并通过 API 端点暴露给前端。

> **架构更新**: 系统已重构为基于团队-用户组合键的精简架构，提供更高效的数据组织和查询性能。

## 功能特性

### 1. Redis 数据结构

在 `packages/webapps/lib/redis.ts` 中使用精简的组合键模式：

- `activities:team:{teamId}:user:{address}` - 特定团队中特定用户的活动流

**架构优势**：

- 减少数据冗余：每个活动只存储一次
- 提高查询效率：使用 Redis pipeline 和键模式匹配
- 简化数据管理：无需维护多个重复的活动流

### 2. 活动数据模型

在 `packages/webapps/lib/typings.d.ts` 中定义了精简的 `Activity` 类型：

```typescript
export type Activity = {
  id: string;
  user: `0x${string}`;
  teamId: number;
  action: string;
  idoAmount: number; // 个人获得的 IDO 代币数量
  wedoAmount: number; // 团队金库获得的 WEDO 代币数量
  txHash?: string;
  timestamp: number;
};
```

**精简说明**：

- 移除了 `actionType` 枚举，改用描述性的 `action` 字符串
- 将 `points`、`personalPoints`、`teamPoints` 合并为更明确的 `idoAmount` 和 `wedoAmount`
- 移除了冗余字段，专注于核心积分追踪功能

### 3. API 端点

在 `packages/webapps/app/api/[[...route]]/route.ts` 中重构了 API 端点：

#### 团队活动查询

- `GET /api/teams/:teamId/activities` - 获取指定团队的所有活动

**实现特点**：

- 使用 Redis `keys()` 匹配团队活动模式：`activities:team:{teamId}:user:*`
- 通过 pipeline 批量获取数据，提高性能
- 返回该团队所有成员的活动记录

**移除的端点**：

- 移除了全局活动流端点（简化架构）
- 移除了单用户活动流端点（通过团队活动可获取）
- 移除了演示数据端点（生产环境不需要）

### 4. 自动活动记录

系统精简了活动记录逻辑：

#### 积分奖励 (`/credit` 端点)

- 自动记录用户获得学习积分的活动
- 包含 `idoAmount`（个人积分）和 `wedoAmount`（团队金库积分）
- 包含交易哈希 `txHash` 用于区块链追溯

#### 简化的成员事件处理

- **移除**了加入/离开部落的活动记录
- 专注于积分相关的核心活动追踪
- 减少系统复杂性和存储开销

### 5. 前端集成

#### API 客户端重构

**移除了** `activitiesApi` 辅助函数，改用直接的 Hono 客户端调用：

```typescript
// 在组件中直接使用
const res = await apiClient.teams[":teamId"].activities.$get({
  param: { teamId: clan.id.toString() },
});
const activities = await res.json();
```

**优势**：

- 减少抽象层，代码更直接
- 更好的 TypeScript 类型支持
- 与 Hono 客户端保持一致

#### UI 组件更新

在 `packages/webapps/app/leaderboard/clan-detail.dialog.tsx` 中的改进：

- **新增用户头像**：使用 `blo` 生成的区块链地址头像
- **精简积分显示**：直接显示 `idoAmount` 和 `wedoAmount` 数值
- **移除复杂的代币格式化**：改用简单的小数格式 `toFixed(2)`
- **保持核心功能**：
  - React Query 获取团队活动数据
  - 加载状态和空状态处理
  - 点击活动查看区块链交易详情

## 数据流

### 1. 精简的活动创建流程

```
用户积分操作 → 智能合约交易 → 后端处理 → Redis 单键存储 → 前端展示
```

### 2. Redis 存储策略重构

- **单一存储位置**：`activities:team:{teamId}:user:{address}`
- 使用 List 数据结构，最新活动在列表头部
- **消除数据冗余**：每个活动只存储一次
- **无需自动清理**：专注于积分活动，数据量可控

### 3. 查询优化策略

- **键模式匹配**：使用 `Redis.keys()` 查找团队所有活动
- **Pipeline 批量获取**：一次性获取所有匹配键的数据
- **前端缓存**：React Query 提供自动缓存和重新验证

## 使用示例

### 获取团队活动

```bash
curl "http://localhost:3000/api/teams/1/activities"
```

**响应示例**：

```json
[
  {
    "id": "1703123456789-abc123",
    "user": "0x742d35Cc6636C0532925a3b8D4d5A9e6C8D83C35",
    "teamId": 1,
    "action": "获得学习积分",
    "idoAmount": 32,
    "wedoAmount": 8,
    "txHash": "0x7509932b2c6e522df9757ea82a269548fce2a7f2eb4bf1856553a6c387fab02b",
    "timestamp": 1703123456789
  }
]
```

> **注意**：当前实现中，从 Redis 获取的数据需要 JSON 解析。建议在 API 端点中添加 `JSON.parse()` 处理：
>
> ```typescript
> activities = results.flatMap((r) =>
>   r.map((x) => JSON.parse(x as string) as Activity)
> );
> ```

## 监控和维护

### Redis 内存管理

**重构后的简化策略**：

- 每个用户在每个团队中的活动记录独立存储
- 数据量自然受限于团队规模和活动频率
- **移除**了复杂的数据清理逻辑，依赖业务场景自然控制

### 错误处理

- API 端点使用 Zod 进行参数验证
- 前端 React Query 提供自动错误处理和重试
- Redis 操作包含完整的 try-catch 和日志记录

## 未来增强

### 1. 性能优化

- **考虑 Redis Streams**：如需要更复杂的查询和消费者组功能
- **添加索引**：按时间范围或活动类型快速过滤
- **分页支持**：为大量活动数据添加分页机制

### 2. 功能扩展

- **重新引入团队事件**：如果需要追踪加入/离开等非积分活动
- **活动聚合**：按时间段聚合积分统计
- **导出功能**：支持活动数据的 CSV/JSON 导出

### 3. 实时更新

- **WebSocket 集成**：实时推送新活动到前端
- **乐观更新**：前端立即显示新活动，后端确认后同步

### 4. 监控增强

- **性能指标**：监控 Redis 查询性能和键数量
- **业务指标**：追踪团队活跃度和积分分布

## 技术栈

- **后端**: Hono.js + Vercel Edge Runtime
- **数据库**: Redis (Upstash)
- **前端**: Next.js + React Query + TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
