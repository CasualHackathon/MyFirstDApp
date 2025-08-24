# 📁 Xide 区块链教育平台 - 项目结构说明

## 🏗️ 整体架构

```
xide_backend/
├── 📁 database/              # 数据库层
│   └── 📄 database.js        # 数据库连接、表结构、初始化
├── 📁 middleware/            # 中间件层
│   └── 📄 validation.js      # 数据验证中间件
├── 📁 routes/                # 路由层
│   ├── 📄 courseRoutes.js    # 课程相关API路由
│   ├── 📄 userRoutes.js      # 用户相关API路由
│   └── 📄 pointsRoutes.js    # 积分相关API路由
├── 📁 test/                  # 测试文件
│   └── 📄 test.js           # API功能测试
├── 📁 uploads/               # 文件上传目录 (运行时创建)
├── 📁 database/              # 数据库文件目录 (运行时创建)
├── 📁 logs/                  # 日志文件目录 (运行时创建)
├── 📄 server.js              # 主服务器文件
├── 📄 package.json           # 项目配置和依赖
├── 📄 config.env             # 环境配置文件模板
├── 📄 .env                   # 实际环境配置 (运行时创建)
├── 📄 .gitignore             # Git忽略文件
├── 📄 start.sh               # Linux/macOS启动脚本
├── 📄 start.bat              # Windows启动脚本
├── 📄 README.md              # 项目详细说明文档
├── 📄 QUICKSTART.md          # 快速启动指南
└── 📄 PROJECT_STRUCTURE.md   # 项目结构说明 (本文件)
```

## 🔧 技术架构层次

### 1. 表现层 (Presentation Layer)

- **server.js**: Express 服务器配置、中间件、路由注册 (端口: 10086)
- **routes/**: RESTful API 路由定义

### 2. 业务逻辑层 (Business Logic Layer)

- **middleware/**: 业务逻辑中间件，如数据验证
- 路由文件中的业务逻辑处理

### 3. 数据访问层 (Data Access Layer)

- **database/database.js**: 数据库连接、SQL 操作、事务管理

### 4. 数据存储层 (Data Storage Layer)

- **SQLite 数据库**: 本地文件数据库，包含所有业务数据

## 📊 数据库设计

### 核心表关系

```
users (用户表)
├── id (主键)
├── wallet_id (Web3钱包ID，唯一)
├── username, email, avatar
└── total_points (总积分)

courses (课程表)
├── id (主键)
├── title, instructor, value
├── rating, rating_count
├── publish_time, live_time
├── category, description
└── status (active/inactive/deleted)

user_courses (用户课程关联表)
├── id (主键)
├── user_id (外键 -> users.id)
├── course_id (外键 -> courses.id)
├── watch_time, completion_rate
└── points_earned

points_logs (积分日志表)
├── id (主键)
├── user_id (外键 -> users.id)
├── course_id (外键 -> courses.id，可选)
├── points_change (+获得/-消费)
├── reason (变动原因)
└── balance_after (变动后余额)

course_categories (课程类别表)
├── id (主键)
├── name (类别名称)
└── description (类别描述)
```

## 🚀 API 接口架构

### RESTful 设计原则

- **资源导向**: 每个 API 端点代表一个资源
- **HTTP 方法语义**: GET(查询)、POST(创建)、PUT(更新)、DELETE(删除)
- **状态码规范**: 200(成功)、201(创建)、400(错误)、404(未找到)、500(服务器错误)

### 主要 API 模块

#### 课程管理 (`/api/courses`)

- `GET /` - 获取课程列表 (支持分页、筛选、搜索)
- `GET /:id` - 获取课程详情
- `POST /` - 创建新课程
- `PUT /:id` - 更新课程信息
- `DELETE /:id` - 删除课程
- `GET /categories` - 获取课程类别

#### 用户管理 (`/api/users`)

- `POST /` - 创建用户 (通过钱包 ID)
- `GET /:wallet_id` - 获取用户信息
- `PUT /:wallet_id` - 更新用户信息
- `POST /:wallet_id/join-course` - 用户加入课程
- `GET /:wallet_id/courses` - 获取用户课程列表
- `PUT /:wallet_id/courses/:course_id/progress` - 更新学习进度

#### 积分系统 (`/api/points`)

- `GET /:wallet_id` - 获取用户积分余额
- `POST /:wallet_id/earn` - 用户获得积分
- `POST /:wallet_id/spend` - 用户消费积分
- `GET /:wallet_id/logs` - 获取积分变动日志
- `GET /:wallet_id/statistics` - 获取积分统计信息

## 🔒 安全特性

### 输入验证

- **Joi 验证**: 所有 API 输入都经过严格验证
- **参数化查询**: 防止 SQL 注入攻击
- **类型检查**: 确保数据类型正确性

### 安全中间件

- **Helmet**: 设置安全 HTTP 头
- **CORS**: 控制跨域请求
- **Rate Limiting**: 防止 API 滥用
- **Morgan**: 请求日志记录

## 📈 扩展性设计

### 模块化架构

- **路由分离**: 按功能模块分离路由文件
- **中间件复用**: 验证、认证等中间件可复用
- **数据库抽象**: 数据库操作封装，便于切换数据库

### 配置管理

- **环境变量**: 支持开发、测试、生产环境配置
- **配置文件**: 集中管理数据库、安全等配置
- **启动脚本**: 自动化环境检查和依赖安装

## 🧪 测试策略

### 测试覆盖

- **API 测试**: 验证所有接口功能正常
- **数据验证**: 测试输入验证和错误处理
- **数据库操作**: 测试 CRUD 操作和事务处理

### 测试工具

- **axios**: HTTP 客户端，用于 API 测试
- **test.js**: 集成测试文件，验证完整流程

## 🚀 部署架构

### 开发环境

- **本地开发**: Node.js + SQLite
- **热重载**: nodemon 自动重启服务
- **调试支持**: 详细的错误信息和日志

### 生产环境

- **进程管理**: PM2 或 Docker 容器化
- **数据库**: 可升级到 PostgreSQL 或 MySQL
- **负载均衡**: 支持多实例部署
- **监控日志**: 生产级日志和监控

## 📚 开发指南

### 添加新功能

1. **数据库层**: 在`database.js`中添加新表结构
2. **路由层**: 创建新的路由文件或扩展现有路由
3. **验证层**: 在`validation.js`中添加数据验证规则
4. **测试**: 在`test.js`中添加测试用例

### 代码规范

- **JSDoc 注释**: 所有函数和类都有详细注释
- **错误处理**: 统一的错误处理和响应格式
- **日志记录**: 关键操作都有日志记录
- **事务管理**: 涉及多表操作时使用数据库事务

---

🎯 **这个架构设计确保了系统的可维护性、可扩展性和安全性，为区块链教育平台提供了坚实的基础！**
