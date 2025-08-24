#!/bin/bash

# 部署脚本 - 自动使用默认私钥
echo "🚀 开始部署 Counter 合约..."

# 使用默认私钥部署
forge script script/Counter.s.sol:Deploy \
    --rpc-url 127.0.0.1:8545 \
    --broadcast \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

echo "✅ 部署完成！"
echo "📋 合约地址: 0x5FbDB2315678afecb367f032d93F642f64180aa3"
