# 想法

主要使用 nextjs + r3f + deri? + solidy + vercel

## 工程

1. 技术选型，solidy/foundry/harhat 等其他合约选型，技术上使用没用过的 nextjs 的 ssr 渲染 3d 模型。短期 mvp 使用 cc 等其他工具实现单测
2. commitlint/eslint/husky 规范化
3. CICD 使用 github actions，配合 qodo 实现 pr 审查等使用 ai 管理，PockeFlow 去生成仓库文档，部署上 nextjs 及项目要求 vercel 部署
4. load 比较多 3D 模型的时候性能可能会捉急，如何优化充分利用 API 请求 load 返回时间及 ssr,tubropack 增量更新
5. gsap 动画优化，静态资源优化

## 业务流程

1. 3D 生成使用 meshy.ai 或者其他生成式 API 去实现
   1. API 申请，使用时 api 轮训还是可供选择自配置
   2. API 配置放在哪里，如何保证 key 的安全不被打野使用
2. 根据 prompt 去请求 API，请求后下载模型展示还是直接展示，等待动画需要美化有趣，返回数据及模型可供用户选择，展示时候需要 autoRotate。
3. 选择后请求合约实现链上
4. 部署需要和工程方面耦合

# 价值

1. 拥有类似 nft 的个人资产，根据个人画像等资产及 prompt 喜好生成个性化非同质 3D 资产

# 想法

主要使用 nextjs + r3f + deri? + solidy + vercel

## 工程

1. 技术选型，solidy/foundry/harhat 等其他合约选型，技术上使用没用过的 nextjs 的 ssr 渲染 3d 模型。短期 mvp 使用 cc 等其他工具实现单测
2. commitlint/eslint/husky 规范化
3. CICD 使用 github actions，配合 qodo 实现 pr 审查等使用 ai 管理，PockeFlow 去生成仓库文档，部署上 nextjs 及项目要求 vercel 部署
4. load 比较多 3D 模型的时候性能可能会捉急，如何优化充分利用 API 请求 load 返回时间及 ssr,tubropack 增量更新
5. gsap 动画优化，静态资源优化

## 业务流程

1. 3D 生成使用 meshy.ai 或者其他生成式 API 去实现
   1. API 申请，使用时 api 轮训还是可供选择自配置
   2. API 配置放在哪里，如何保证 key 的安全不被打野使用
2. 根据 prompt 去请求 API，请求后下载模型展示还是直接展示，等待动画需要美化有趣，返回数据及模型可供用户选择，展示时候需要 autoRotate。
3. 选择后请求合约实现链上
4. 部署需要和工程方面耦合

# 价值

1. 拥有类似 nft 的个人资产，根据个人画像等资产及 prompt 喜好生成个性化非同质 3D 资产
