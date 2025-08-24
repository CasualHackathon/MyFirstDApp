/**
 * @fileoverview 主服务器文件 - 区块链教育平台后端API系统
 * @author Xide Team
 */

// 加载环境变量
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

// 导入路由
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const pointsRoutes = require("./routes/pointsRoutes");

// 导入数据库初始化
const { initDatabase } = require("./database/database");

const app = express();
const PORT = process.env.PORT || 10086;

// 安全中间件
app.use(helmet());

// CORS配置
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : [`http://localhost:${PORT}`, `http://localhost:${PORT + 1}`],
    credentials: true,
  })
);

// 请求限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: "请求过于频繁，请稍后再试",
  },
});
app.use("/api/", limiter);

// 日志中间件
app.use(morgan("combined"));

// 解析JSON请求体
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 静态文件服务
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API路由
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/points", pointsRoutes);

// 健康检查端点
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "服务器运行正常",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404处理
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "请求的资源不存在",
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error("错误:", err);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "服务器内部错误",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();
    console.log("✅ 数据库初始化成功");

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器启动成功`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`📊 健康检查: http://localhost:${PORT}/health`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ 服务器启动失败:", error);
    process.exit(1);
  }
}

// 优雅关闭
process.on("SIGTERM", () => {
  console.log("收到SIGTERM信号，正在关闭服务器...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("收到SIGINT信号，正在关闭服务器...");
  process.exit(0);
});

startServer();
