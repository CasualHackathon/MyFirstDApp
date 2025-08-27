# 🔧 DD 项目故障排除指南

## 🚨 常见错误及解决方案

### 1. CALL_EXCEPTION 错误

**错误信息：**
```
Error: call revert exception [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] 
(method="totalProjects()", data="0x", errorArgs=null, errorName=null, errorSignature=null, reason=null, code=CALL_EXCEPTION, version=abi/5.7.0)
```

**问题原因：**
- 连接了错误的网络（不是 Sepolia 测试网）
- 合约地址不正确
- 合约代码不存在
- MetaMask 未正确连接

**解决方案：**

#### 步骤 1: 检查网络连接
1. 确保 MetaMask 连接的是 **Sepolia 测试网**
2. 网络信息：
   - **网络名称**: Sepolia Testnet
   - **Chain ID**: 11155111 (0xaa36a7)
   - **RPC URL**: https://sepolia.infura.io/v3/67d1669f03194a7ca5b5b74589c18c2d
   - **区块浏览器**: https://sepolia.etherscan.io/

#### 步骤 2: 添加 Sepolia 网络到 MetaMask
1. 打开 MetaMask
2. 点击网络选择器（显示当前网络名称）
3. 选择 "Add Network"
4. 填写网络信息：
   - Network Name: `Sepolia Testnet`
   - New RPC URL: `https://sepolia.infura.io/v3/67d1669f03194a7ca5b5b74589c18c2d`
   - Chain ID: `11155111`
   - Currency Symbol: `SEP`
   - Block Explorer URL: `https://sepolia.etherscan.io/`

#### 步骤 3: 获取测试 ETH
1. 访问 [Sepolia 水龙头](https://sepoliafaucet.com/)
2. 输入你的钱包地址
3. 等待几分钟接收测试 ETH
4. 确认 MetaMask 中显示测试 ETH

#### 步骤 4: 重新连接钱包
1. 刷新页面
2. 点击 "Connect Wallet" 按钮
3. 授权 MetaMask 连接
4. 确保网络显示为 "Sepolia Testnet"

### 2. 项目创建后不显示

**问题原因：**
- 区块链交易确认延迟
- 事件监听问题
- 网络连接不稳定

**解决方案：**
1. 等待 3-5 秒让交易确认
2. 点击 "Refresh" 按钮手动刷新
3. 检查浏览器控制台日志
4. 使用 "Debug" 按钮检查合约状态

### 3. MetaMask 连接失败

**问题原因：**
- MetaMask 未安装
- 浏览器不支持
- 权限被拒绝

**解决方案：**
1. 安装 [MetaMask 扩展](https://metamask.io/download/)
2. 创建或导入钱包
3. 解锁钱包
4. 刷新页面重试

## 🛠️ 调试工具

### Debug 按钮
点击 "Debug" 按钮可以：
- 检查合约连接状态
- 验证网络配置
- 测试合约方法调用
- 查看详细错误信息

### Network 状态显示
页面顶部显示当前网络状态：
- 🟢 绿色：连接正确（Sepolia 测试网）
- 🔴 红色：连接错误（其他网络）

### 控制台日志
打开浏览器开发者工具 (F12)，查看 Console 标签页：
- 详细的合约调用日志
- 错误信息和堆栈跟踪
- 网络连接状态

## 📋 检查清单

在开始使用前，请确认：

- [ ] MetaMask 已安装并解锁
- [ ] 连接到 Sepolia 测试网 (Chain ID: 11155111)
- [ ] 账户有足够的测试 ETH
- [ ] 网络连接稳定
- [ ] 浏览器支持 Web3

## 🔗 有用链接

- [MetaMask 下载](https://metamask.io/download/)
- [Sepolia 水龙头](https://sepoliafaucet.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [合约地址](https://sepolia.etherscan.io/address/0xD70B1FE1E96996dac8806D50b9Bd7B94a1fF8C35)

## 📞 获取帮助

如果问题仍然存在：

1. 检查浏览器控制台的错误信息
2. 使用 Debug 按钮获取详细信息
3. 确认网络配置正确
4. 尝试重新连接钱包
5. 联系技术支持

---

**记住：** 确保你始终连接到 Sepolia 测试网，这是合约部署的网络！
