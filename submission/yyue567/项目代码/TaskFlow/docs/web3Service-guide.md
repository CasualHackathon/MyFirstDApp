# Web3Service 使用指南

## 概述

`web3Service` 是一个用于与 TaskFlow 智能合约交互的服务类，提供了连接钱包、创建任务、获取任务、接受任务等功能。

## 功能特性

- 🔗 连接/断开 MetaMask 钱包
- 📝 创建新任务
- 📋 获取所有任务列表
- ✅ 接受任务
- 👥 获取任务接受者列表
- 💰 自动处理 ETH 金额转换

## 安装依赖

确保已安装以下依赖：

```bash
npm install ethers @metamask/detect-provider
```

## 基本使用

### 1. 导入服务

```typescript
import { web3Service } from '@/utils/web3Service';
import type { CreateTaskParams } from '@/types/task';
```

### 2. 连接钱包

```typescript
try {
  await web3Service.connect();
  const address = await web3Service.getAddress();
  console.log('钱包连接成功，地址:', address);
} catch (error) {
  console.error('连接钱包失败:', error);
}
```

### 3. 创建任务

```typescript
const taskParams: CreateTaskParams = {
  amount: '0.01', // 0.01 ETH
  deadline: '2024-12-31', // 截止日期
  title: '开发一个Vue.js组件',
  description: '需要开发一个可复用的Vue.js组件，包含表单验证功能'
};

try {
  const tx = await web3Service.createTask(taskParams);
  console.log('任务创建成功，交易哈希:', tx.hash);
} catch (error) {
  console.error('创建任务失败:', error);
}
```

### 4. 获取所有任务

```typescript
try {
  const tasks = await web3Service.getTasks();
  console.log('获取到', tasks.length, '个任务');
  
  tasks.forEach(task => {
    console.log(`任务 ${task.id}: ${task.title}`);
    console.log(`金额: ${task.amount} ETH`);
    console.log(`截止时间: ${task.deadline}`);
  });
} catch (error) {
  console.error('获取任务失败:', error);
}
```

### 5. 接受任务

```typescript
try {
  const tx = await web3Service.acceptTask(1); // 接受任务ID为1的任务
  console.log('任务接受成功，交易哈希:', tx.hash);
} catch (error) {
  console.error('接受任务失败:', error);
}
```

### 6. 获取任务接受者

```typescript
try {
  const accepters = await web3Service.getAcceptedBy(1);
  console.log('任务1的接受者:', accepters);
} catch (error) {
  console.error('获取任务接受者失败:', error);
}
```

### 7. 断开钱包连接

```typescript
try {
  await web3Service.disconnect();
  console.log('钱包已断开连接');
} catch (error) {
  console.error('断开钱包连接失败:', error);
}
```

## 数据类型

### Task 接口

```typescript
interface Task {
  id: number;
  userId: number;
  amount: string; // ETH 格式的金额
  deadline: string;
  user: string; // 发布者地址
  title: string;
  description: string;
  acceptedBy: string[]; // 接受任务的用户地址列表
}
```

### CreateTaskParams 接口

```typescript
interface CreateTaskParams {
  amount: string; // ETH 格式的金额
  deadline: string;
  title: string;
  description: string;
}
```

## 错误处理

所有方法都可能抛出错误，建议使用 try-catch 进行错误处理：

```typescript
try {
  const result = await web3Service.someMethod();
  // 处理成功结果
} catch (error) {
  console.error('操作失败:', error);
  // 处理错误
}
```

## 注意事项

1. **合约地址**: 确保 `TASKFLOW_ADDRESS` 指向正确的合约地址
2. **网络连接**: 确保 MetaMask 连接到正确的网络
3. **Gas 费用**: 所有交易都需要支付 Gas 费用
4. **权限**: 某些操作可能需要用户授权

## 完整示例

参考 `src/examples/web3ServiceUsage.ts` 文件查看完整的使用示例。

## 故障排除

### 常见问题

1. **"请安装MetaMask钱包"**
   - 确保已安装 MetaMask 浏览器扩展
   - 确保 MetaMask 已解锁

2. **"请先连接钱包"**
   - 调用合约方法前必须先调用 `connect()` 方法

3. **"合约调用失败"**
   - 检查合约地址是否正确
   - 检查网络连接
   - 检查用户是否有足够的 ETH 支付 Gas 费用

4. **"交易被拒绝"**
   - 用户可能在 MetaMask 中拒绝了交易
   - 检查交易参数是否正确
