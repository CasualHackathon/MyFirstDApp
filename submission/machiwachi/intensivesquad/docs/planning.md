### 基于 `docs/tokenomics-v2.md` 的执行规划（Planning）

- **范围**: 智能合约（双代币+团队经济）、部署与脚本、Web 前端集成、测试/安全、治理与运营手册
- **核心目标**: 按文档 MVP 实现 `IDOToken`、`WEDOToken`、`TeamManager`、`TeamEconomy`，提供“团队 WEDO → 按 L 均分 → 个人 IDO 可领取”的完整闭环

### 里程碑与时间线（建议 4-6 周）

- **M0 需求冻结（0.5 周）**: 精度、事件、角色、`S` 延迟生效策略确定
- **M1 合约骨架（1 周）**: OZ 依赖、角色、事件、存储布局、基础接口
- **M2 经济逻辑（1 周）**: 记账与分配、`withdraw/claim`、`credit*`、`S` 生效机制
- **M3 测试与安全（1-1.5 周）**: 单测+属性/模糊测试、覆盖率、reentrancy/权限/边界
- **M4 脚本+前端（1 周）**: Ignition 部署、Hardhat 任务、Wagmi 集成、基础页面
- **M5 试运行与上链（0.5-1 周）**: Testnet 联调、运营流程演练、上主网/或公开测试

---

### 任务分解（Backlog）

#### A. 智能合约（packages/contracts）

- **A1 IDOToken（ERC20 + AccessControl）**

  - 角色：`DEFAULT_ADMIN_ROLE`（多签）、`MINTER_ROLE`（授予 `TeamEconomy`）
  - 用途：个人积分与最终分红展示；仅 `mint`
  - 验收：非授权不能 mint；事件正确

- **A2 WEDOToken（ERC20 + AccessControl）**

  - 角色：`MINTER_ROLE`（授予 `TeamEconomy` 或记账入口）
  - 用途：团队储备；在 `withdraw` 消耗/销毁
  - 验收：仅授权可增发；扣账一致

- **A3 TeamManager**

  - 存储：
    - `teams[teamId] = { n0, lMin, lMax, flagURI, currentR }`
    - `members[teamId][account] = { status, joinedAt, eliminatedAt, cooldownEndsAt }`
  - 接口/事件：`createTeam`、`join`、`eliminate`、`leave`、`TeamCreated/MemberJoined/MemberEliminated/...`
  - 约束：单账号同一时刻仅在一个团队；冷却检查；`currentR` 增减正确

- **A4 TeamEconomy（核心）**

  - 角色：`DEFAULT_ADMIN_ROLE`、`DISTRIBUTOR_ROLE`、`PARAM_ROLE`
  - 存储：`ido`、`wedo`、`teamManager`、`teamWedoBalance`、`accIdoPerSurvivor`、`user.rewardDebt`、`S`（1e18）、`residual`
  - 接口：
    - 参数：`setStageScalar(S)`（可带延迟生效；事件 `StageScalarUpdated`）
    - 入账：`creditTeamWEDO(teamId, amount)`、`creditPersonalIDO(account, amount)`
    - 转换：`withdraw(teamId, amountWEDO)`、`withdrawAll(teamId)`
    - 领取：`claim(teamId)`、`claimMany(teamIds[])`
    - 只读：`pendingIdo`、`getTeamL`、`getR`、`getStageScalar`
  - 逻辑：
    - `L = S × (lMin + (lMax - lMin) × R / n0)`（1e18 定点）
    - `mintIdo = amountWEDO × L`；`perCapita = mintIdo / R`（向下取整）
    - `accIdoPerSurvivor += perCapita`；`claim` 结算差额后 mint IDO
  - 安全：`nonReentrant`、必要时 `pause`、权限校验

- **A5 安全与治理**
  - ReentrancyGuard、AccessControl、（可选）Pausable
  - `S` 延迟生效窗口（如 6h）
  - 事件覆盖、错误消息规范

#### B. 测试与质量

- **B1 单元测试**：角色、成员边界、`credit*`、`withdraw/claim`、精度/残差、`S` 变更
- **B2 属性/模糊测试**：随机 `join/eliminate/withdraw/claim` 不破坏不变量
- **B3 工具**：覆盖率、Gas Reporter、（可选）Slither

#### C. 部署与脚本

- **C1 Ignition 模块**：四合约模块与一体化编排
- **C2 Hardhat 任务**：角色授予、`setStageScalar`、样例团队
- **C3 环境**：网络/RPC/账户、初值 `S/lMin/lMax/n0`

#### D. Web 集成（packages/webapps）

- **D1 读数**：团队 `R/L`、`teamWedoBalance`、`accIdoPerSurvivor`、个人 `pendingIdo`
- **D2 交互**：`join/withdraw/withdrawAll/claim/claimMany`
- **D3 管理**：`createTeam/eliminate/setStageScalar`
- **D4 UX**：边界拦截、交易状态、公式可视化

#### E. 运营与文档

- **E1 Runbook**：`S` 更新、淘汰/冷却、异常与暂停
- **E2 观察性**：事件订阅/统计（可选子图）
- **E3 风险**：参数误设、Gas 峰值、成员 churn、重入/授权、时间操纵

---

### 交付与验收标准（DoD）

- **合约**: 功能齐备、事件完整、权限安全、≥90% 覆盖
- **脚本**: 一键部署与角色配置、回滚指引
- **前端**: 读数准确、核心交易可达、边界交互完整
- **文档**: README/运营手册/参数说明完善
- **试运行**: Testnet 场景演练通过（创建团队 → 入账 → 择时 withdraw→ 成员 claim）

---

### 任务看板（建议顺序）

- 合约
  - [ ] `IDOToken`
  - [ ] `WEDOToken`
  - [ ] `TeamManager`
  - [ ] `TeamEconomy`（含 `S` 延迟）
  - [ ] 单元/属性测试
- 脚本/部署
  - [ ] Ignition 模块
  - [ ] 角色授予与样例数据
- 前端
  - [ ] 团队列表/详情/成员
  - [ ] `withdraw/claim` 交互
  - [ ] 管理操作（受限显示）
- 文档与运营
  - [ ] 参数与公式说明
  - [ ] 运营流程与应急预案
  - [ ] 指标与事件订阅

---

### 关键开放问题（需尽早确认）

- **参数**: `L_min/L_max/S` 初值与边界；`S` 延迟窗口长度
- **成员规则**: 冷却时长；是否允许管理员强制离队
- **Gas 策略**: `withdrawAll` 限频/阈值；是否引入协议费
- **可选增强**: 子图接入；贡献加权分配变体是否纳入后续版本

---

### 里程碑输出示例

- M1: 四合约骨架+事件+角色；基础测试跑通
- M2: 完整 `withdraw/claim/credit` + 公式精度+残差；核心测试通过
- M3: 安全检查+属性测试+覆盖率+Gas 报告
- M4: 部署脚本/模块+前端基本页面与交互
- M5: Testnet 联调、运营演练与上链清单
