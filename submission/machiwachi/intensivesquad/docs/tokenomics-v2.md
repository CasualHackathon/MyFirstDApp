# 双代币方案

> 简化代币方案：分为两个代币 IDO（个人代币）和 WEDO（团队分红代币），两者的汇率根据不同团队的 L_i 来定，团队目标转变为寻求$WEDO和$IDO 之间的转化策略，同时根据游戏进程动态调整 L_i。

$L_i$ 的公式为 $L_i(S_i, R_i) = S(L*{min} + (L*{max}-L*{min}) \times \frac{R_i}{N})$

$S_i$ 由平台管理员更新，寓意是当前活动进入第几周手动配置，比如第一周是 1，第二周是 2，以此类推。

$IDO 和 $WEDO 之间的转化策略：任意团队成员可以执行 `Withdraw`，按照当前团队 $L_i$ 将 $WEDO 转化为 $IDO 后打入所有团队内幸存玩家的钱包

引入的目的是：

- 简化团队和个人的代币分配模型
- 增加团队，个人以及项目进展阶段之间的动态博弈

### 目标与关键假设

- 引入双代币：`IDO`（个人积分代币，可转移）与 `WEDO`（团队累积代币，不直接用于排行，作为可转换储备）。
- 团队增益按公式在“转换时点”生效：将团队累积的 `WEDO` 按当前团队的 \(L_i(S, R_i)\) 转换为 `IDO`，并分配给“当前幸存成员”。
- 假设：
  - 日常活动时：个人部分直接铸造 `IDO` 给个人；团队部分铸造 `WEDO` 到团队金库（不乘 L）。
  - `L_i(S, R_i) = S \times \left(L_{min} + (L_{max}-L_{min}) \times \frac{R_i}{N}\right)`，其中 `S` 为平台级阶段系数（按周手动配置，所有团队共用），`R_i` 为团队在籍人数，`N` 为团队初始编制。
  - Withdraw 由任意“当前在籍成员”触发；分配采取“均分给当前幸存者”的策略（不按贡献），以凸显团队协作与“择时转换”的博弈。
  - 分发为“可领取式”，避免 on-chain 批量转账的 gas 风险；成员可随时 `claim` 领取自己份额。

### 合约组件（MVP）

- `IDOToken`（ERC20 + AccessControl）

  - 用途：个人积分与最终分红展示；由系统合约铸造。
  - 角色：`MINTER_ROLE` 授予经济合约；`DEFAULT_ADMIN_ROLE` 多签持有。

- `WEDOToken`（ERC20 + AccessControl）

  - 用途：团队累积的“可转换储备”；仅在 Withdraw 时按 L 转为 `IDO`。
  - 角色：`MINTER_ROLE` 授予结算/记账入口（后端服务或经济合约）。

- `TeamManager`

  - 维护团队与成员关系、`R_i`、编制 `N`、参数 `L_{min}, L_{max}`、冷却等。
  - 事件化加入/淘汰/离队，确保 `R_i` 可链上可信读取。
  - 只存必要状态；不持有资金。

- `TeamEconomy`（团队经济/金库与分配器）
  - 记账团队的 `WEDO` 余额、执行 `Withdraw`，计算并累积每位幸存成员的 `IDO` 可领取额。
  - 引入“每幸存者累计分红”记账（MasterChef 风格）：
    - `accIdoPerSurvivor[teamId]`（按 1e18 精度）
    - `user.rewardDebt[teamId]`
  - 角色：`DISTRIBUTOR_ROLE`（活动记账铸造 `WEDO`）、`PARAM_ROLE`（设置阶段系数 S）

### 关键状态

- TeamManager
  - `teams[teamId]`: `{ n0, lMin, lMax, flagURI, currentR }`
  - `members[teamId][account]`: `{ status, joinedAt, eliminatedAt, cooldownEndsAt }`
- TeamEconomy
  - `ido`, `wedo`, `teamManager`
  - `teamWedoBalance[teamId]`（可由 `WEDO.balanceOf(this)` 与内部映射共同校验）
  - `accIdoPerSurvivor[teamId]`（累计每幸存者分红）
  - `user[teamId][account].rewardDebt`、`userClaimed[teamId][account]`
  - `S`（平台级阶段系数，1e18 精度；可加入生效时间戳与变更事件）

### 关键函数与事件

- TeamManager

  - `createTeam(flagURI, n0, lMin, lMax) returns (teamId)`（运营）
  - `join(teamId)`（用户，校验未在队、非冷却、未满编；`currentR++`）
  - `eliminate(teamId, member)`（运营；`currentR--`，设置冷却）
  - 事件：`TeamCreated`、`MemberJoined`、`MemberEliminated`、`MemberLeft`、`TeamParamsUpdated`、`CooldownSet`

- TeamEconomy
  - 参数
    - `setStageScalar(S)`（平台管理员，建议带“延迟生效”/时间锁；事件 `StageScalarUpdated(S, effectiveAt)`）
  - 活动入账
    - `creditTeamWEDO(teamId, amount)`（`DISTRIBUTOR_ROLE`；将团队“活动团队份额”铸造为 `WEDO` 注入金库；不乘 L）
    - `creditPersonalIDO(account, amount)`（`DISTRIBUTOR_ROLE`；个人直接拿 `IDO`）
  - Withdraw（核心）
    - `withdraw(teamId, amountWEDO)`（仅当前在籍成员）
      - 读取 `R = TeamManager.currentR(teamId)`；`R > 0`
      - 计算 `L = S * (lMin + (lMax - lMin) * R / n0)`（按 1e18 精度）
      - 消耗/销毁团队 `WEDO`：`amountWEDO`
      - 计算可分发 `mintIdo = amountWEDO * L`
      - 计算人均：`perCapita = mintIdo / R`
      - 更新 `accIdoPerSurvivor[teamId] += perCapita`
      - 事件：`TeamWithdraw(teamId, caller, amountWEDO, L, mintIdo, R)`
    - 可加 `withdrawAll(teamId)`：将全部 `teamWedoBalance[teamId]` 转换
  - 领取
    - `claim(teamId)` / `claimMany(teamIds[])`
      - 校验：按成员最后一次活跃状态结算差额 `pending = accIdoPerSurvivor - rewardDebt`
      - 铸造 `IDO` 给 `msg.sender`；更新 `rewardDebt`
      - 事件：`Claimed(teamId, account, amount)`
    - 在 `join/eliminate/leave` 由 `TeamManager` 回调或由用户操作时，先 `claim` 再更新 `rewardDebt`，确保公平边界。
  - 只读与审计
    - `pendingIdo(teamId, account)`：便于前端显示
    - `getTeamL(teamId)`、`getR(teamId)`、`getStageScalar()`

### 公式与精度

- \( L*i = S \times \left(L*{min} + (L*{max}-L*{min}) \times \frac{R_i}{N}\right) \)
- 精度建议：所有系数采用 `1e18` 定点；`S, L_{min}, L_{max}` 以 18 位小数表达。
- 舍入：`perCapita = mintIdo / R` 向下取整，多余尘额累积在合约，对下一次 `withdraw` 继续参与（可记录 `residual[teamId]`）。

### 权限与安全

- 角色
  - `DEFAULT_ADMIN_ROLE`（多签）：授予/回收角色、暂停
  - `DISTRIBUTOR_ROLE`：活动入账（`creditTeamWEDO/creditPersonalIDO`）
  - `PARAM_ROLE`：`setStageScalar`
- 约束
  - `withdraw`：仅团队在籍成员；`R>0`；`amountWEDO>0`；重入保护
  - `claim`：允许任意时间调用；`nonReentrant`
  - `WEDO` 在 `withdraw` 时由合约内部销毁/扣账，防重复转换
- 治理
  - `S` 更新建议引入“延迟生效”：减少被操纵择时的争议（例如 `effectiveAt = now + 6h`）
  - 可选 `pause`：紧急停发

### 生命周期与流程

- 日常入账
  - 后端审核活动：个人部分调用 `creditPersonalIDO(account, p*α)`；团队部分调用 `creditTeamWEDO(teamId, p*(1-α))`（不乘 L）
- 选择时点转换
  - 任意在籍成员 `withdraw(teamId, amount)`：按“当前 `S` 与 `R`”将 `WEDO` 转为 `IDO`，更新每幸存者累计指标
- 领取
  - 成员调用 `claim(teamId)`，获得 `IDO`
  - `join`/`eliminate/leave` 前后，需“先结算再变更”，保证新老成员边界正确

### 边界与异常

- `R=0` 不允许 `withdraw`
- 成员加入后不享受历史累计；淘汰/离队后不再增长，但可领取历史未领部分
- 多团队限制：同一地址同一时间仅在一个团队（由 `TeamManager` 保证）
- 可选：`withdraw` 限频（如最短间隔 1 小时）以降低刷小额交易

### 可扩展项（非 MVP）

- 将 `S` 配置为“周 →S”的时间表，自动随周推进；或团队级 `S_i` 覆盖
- `withdraw` 自动触发少量批量空投（阈值内）+ 大额走 `claim`
- 引入“贡献加权分配”变体：将 `perCapita` 改为按当期权重分配；保留当前“均分”为默认
- 添加“协议费/金库留存”比例

### 部署与对接

- 顺序：`IDOToken` → `WEDOToken` → `TeamManager` → `TeamEconomy`（配置角色与互相地址）
- 前端/子图订阅：`TeamCreated/MemberJoined/MemberEliminated/...`、`TeamWithdraw/Claimed/StageScalarUpdated` 以及 `ERC20 Transfer`
- 后端仅需具备：活动入账两条接口（`creditPersonalIDO`、`creditTeamWEDO`）与运营接口（`eliminate`、设置 `S`）

—

- 假设采用“均分给幸存者”。若你更偏好“按个人贡献占比”分配，我可以在不改整体框架的前提下，将分配逻辑切换为“贡献权重累计”版本。
