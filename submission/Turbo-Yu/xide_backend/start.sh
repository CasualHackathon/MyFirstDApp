#!/bin/bash

# Xide 区块链教育平台后端启动脚本
# 作者: Xide Team

echo "🚀 启动 Xide 区块链教育平台后端系统..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js (版本 >= 14.0.0)"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm (版本 >= 6.0.0)"
    exit 1
fi

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ 错误: Node.js版本过低，需要版本 >= 14.0.0，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本检查通过: $(node -v)"
echo "✅ npm版本检查通过: $(npm -v)"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

# 检查环境配置文件
if [ ! -f ".env" ]; then
    if [ -f "config.env" ]; then
        echo "📝 复制环境配置文件..."
        cp config.env .env
        echo "✅ 环境配置文件已创建，请根据需要修改 .env 文件"
    else
        echo "⚠️  警告: 未找到环境配置文件，将使用默认配置"
    fi
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p database
mkdir -p uploads
mkdir -p logs

echo "✅ 目录创建完成"

# 启动服务器
echo "🌐 启动服务器..."
echo "📍 服务地址: http://localhost:10086"
echo "📊 健康检查: http://localhost:10086/health"
echo "📖 API文档: 请查看 README.md"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动开发服务器
npm run dev
