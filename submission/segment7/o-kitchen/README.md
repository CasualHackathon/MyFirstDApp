# o-kitchen: Onchain Kitchen for Fandoms

## 项目演示

* **App demo演示**: https://o-kitchen-app.vercel.app


* App 代理合约 : [App Proxy](https://explorer.testnet.lens.xyz/address/0xff041A0EBC95Ece2d8B99Bf9a0E5444aAdf09Af7)
`0xff041A0EBC95Ece2d8B99Bf9a0E5444aAdf09Af7`

* App 逻辑合约 : [App Implementation](https://explorer.testnet.lens.xyz/address/0x72937a847162b079a6d41a3337fd6d384ada3c8e#contract) `0x72937a847162b079a6d41a3337fd6d384ada3c8e`

* TBNL 协议合约测试地址 : [TEST](https://sepolia.etherscan.io/address/0x13036d898B64663A669f9eBb707805c57F8B1b56) `0x13036d898B64663A669f9eBb707805c57F8B1b56`

## 项目概述

**o-kitchen** 是一个面向同人创作者与ACGN爱好者的 **去中心化内容社区平台**。我们把平台比作“链上的厨房”：创作者带来自己的“食材”（同人作品、二创、衍生创意），通过开放协议和可组合的合约工具，实现作品的长期存证、安全发布、链上分享与互动。

这是一个旨在实现 **抗抄袭、抗审查、可持续** 的链上同人创作社交平台，为创作行为提供链上记录，为作品提供链上托管，为内容管理提供自治工具。

>[o-kitchen Labs](https://github.com/o-kitchen) 专注于通过 Web3 技术赋能同人社区，打造长期运行（10年以上）、抗打击、保护创作者数字原生版权的内容生态系统，探索 Web3 在二次元/同人文化中的实际落地。

## 核心功能

1. **作品发布与分布式保存**

   * 支持作者进行文字、插画等多模态创作
   * 作品元数据默认以不可变形式存储，由 Grove（安全的链上可控存储层）管理，分配存储密钥，并通过 Lens URI 封装，用作 Grove 存储层中每个作品的唯一标识。


2. **TBNL 版权一键铸造系统**

   * Token Bound NFT License 许可技术目前基于本项目打造的ERC721合约实现，作品通过元数据抽象，经过特定版权许可条款包裹，被铸造为一个时间戳明确，版权规则清晰的不可篡改的NFT许可证明

3. **标签管理**

   - 支持对作品添加自定义标签

   - 标签系统支持作品分类

3. **内容互动**

   - 支持他人主页访问
   - 支持查看已发布作品
   - 支持链上点赞
   - 支持链上收藏

4. **UX增强**

   * 邮箱免私钥登录 (Family Wallet)
   * 无 Gas 交互（zksync paymaster）
   * 多语言界面，面向全球 ACGN 社群
   * 多主题一键切换
   * 支持移动端


## 代码仓库地址

https://github.com/o-kitchen/app


## 团队成员 List

- Lead/Core dev - [segment7](https://github.com/segment7)

- BD/PM - [Allen 中羊](https://github.com/AllenWang-Yang)

- Core dev ( inactive ) - [aXin](https://github.com/xin-0311)

- Dev - [wang wanlu](https://github.com/wangwanlu09)

- Dev - [Draken](https://github.com/Darkells)

- Dev - [Atomsi](https://github.com/atomsi7)

- Dev - [kuove](https://github.com/kuove)

---

**联系方式**: [Discord 群组](https://discord.gg/Ch6V8QsaMP)
