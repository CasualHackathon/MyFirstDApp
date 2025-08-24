@echo off
chcp 65001 >nul
title Xide 区块链教育平台后端系统

echo 🚀 启动 Xide 区块链教育平台后端系统...

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js (版本 ^>= 14.0.0)
    pause
    exit /b 1
)

REM 检查npm是否安装
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到npm，请先安装npm (版本 ^>= 6.0.0)
    pause
    exit /b 1
)

REM 检查Node.js版本
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
set NODE_VERSION=%NODE_VERSION:~1,1%
if %NODE_VERSION% lss 4 (
    echo ❌ 错误: Node.js版本过低，需要版本 ^>= 14.0.0
    pause
    exit /b 1
)

echo ✅ Node.js版本检查通过
echo ✅ npm版本检查通过

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 安装项目依赖...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装
)

REM 检查环境配置文件
if not exist ".env" (
    if exist "config.env" (
        echo 📝 复制环境配置文件...
        copy config.env .env >nul
        echo ✅ 环境配置文件已创建，请根据需要修改 .env 文件
    ) else (
        echo ⚠️  警告: 未找到环境配置文件，将使用默认配置
    )
)

REM 创建必要的目录
echo 📁 创建必要的目录...
if not exist "database" mkdir database
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs

echo ✅ 目录创建完成

REM 启动服务器
echo 🌐 启动服务器...
echo 📍 服务地址: http://localhost:10086
echo 📊 健康检查: http://localhost:10086/health
echo 📖 API文档: 请查看 README.md
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 启动开发服务器
npm run dev

pause
