# DD Project Manager Frontend

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm start
```

## 🔧 常见问题解决

### ❌ "No contract code at this address" 错误

这个错误通常表示以下问题之一：

#### 问题 1: 网络连接错误
**症状**: 前端连接到了错误的网络（如主网而不是 Sepolia 测试网）

**解决方案**:
1. 确保 MetaMask 连接到 **Sepolia Testnet**
2. 点击页面顶部的 **"Switch to Sepolia"** 按钮
3. 或者在 MetaMask 中手动切换到 Sepolia 测试网

**验证方法**:
- 检查 MetaMask 网络显示是否为 "Sepolia Testnet"
- 网络 ID 应该是: `11155111`

#### 问题 2: 合约未部署
**症状**: 即使连接到正确网络，仍然显示无合约代码

**解决方案**:
1. 检查合约是否已部署到 Sepolia 测试网
2. 验证合约地址: `0xD70B1FE1E96996dac8806D50b9Bd7B94a1fF8C35`
3. 在 [Sepolia Etherscan](https://sepolia.etherscan.io/address/0xD70B1FE1E96996dac8806D50b9Bd7B94a1fF8C35) 上检查合约状态

#### 问题 3: 合约地址错误
**症状**: 前端使用的合约地址与实际部署地址不匹配

**解决方案**:
1. 检查 `frontend/src/services/contractService.ts` 中的 `FACTORY_ADDRESS`
2. 确保地址与部署文档中的地址一致
3. 如果地址已更改，更新前端代码中的地址

## 🧪 诊断工具

### 使用内置诊断功能
1. 连接钱包后，点击 **"Check Contract Status"** 按钮
2. 查看浏览器控制台的详细诊断信息
3. 按照诊断结果的建议进行操作

### 手动验证步骤
1. **检查网络**: 确保连接到 Sepolia 测试网
2. **检查地址**: 验证合约地址是否正确
3. **检查部署**: 在区块浏览器上确认合约状态
4. **检查权限**: 确保钱包有足够的权限

## 🌐 网络配置

### Sepolia 测试网配置
- **网络名称**: Sepolia Testnet
- **RPC URL**: `https://sepolia.infura.io/v3/67d1669f03194a7ca5b5b74589c18c2d`
- **链 ID**: `11155111`
- **代币符号**: SEP
- **区块浏览器**: https://sepolia.etherscan.io/

### 添加网络到 MetaMask
1. 打开 MetaMask
2. 点击网络选择器
3. 选择 "Add Network"
4. 输入上述配置信息

## 📱 功能特性

- ✅ 钱包连接和网络切换
- ✅ 智能合约状态检查
- ✅ 项目创建和管理
- ✅ 实时网络状态显示
- ✅ 内置诊断工具

## 🔗 相关链接

- [合约部署文档](../DEPLOYMENT.md)
- [项目架构说明](../ARCHITECTURE.md)
- [Sepolia 测试网](https://sepolia.etherscan.io/)
- [Infura Sepolia RPC](https://infura.io/docs/ethereum#section/Using-Infura/Using-Sepolia)

## 🆘 获取帮助

如果问题仍然存在：

1. 检查浏览器控制台的错误信息
2. 使用内置诊断工具进行详细检查
3. 确认 MetaMask 版本和配置
4. 检查网络连接和防火墙设置
