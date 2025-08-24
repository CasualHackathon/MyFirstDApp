// packages/nextjs/lib/wallet.ts
import { Alchemy, AssetTransfersCategory, Network, OwnedNftsResponse, SortingOrder } from "alchemy-sdk";

// 定义钱包分析结果的数据结构
export interface WalletTraits {
  transactionCount: number;
  walletAgeInDays: number;
  nftCount: number;
  uniqueContractsInteracted: number;
  tags: string[]; // 存储最终的人格标签
}

// 初始化 Alchemy SDK
// 确保在 .env 文件中添加 ALCHEMY_API_KEY
const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA, // 您可以根据需要更改为 Polygon, Arbitrum 等
});

/**
 * 分析钱包地址并根据您定义的规则返回其链上特征
 * @param address 要分析的钱包地址
 */
export const analyzeWallet = async (address: string): Promise<WalletTraits> => {
  try {
    // --- 数据获取 (并行执行以提高效率) ---

    // 1. 获取总交易次数
    const txCountPromise = alchemy.core.getTransactionCount(address, "latest");

    // 2. 获取用户持有的所有NFT（仅用于计数）
    const nftCountPromise: Promise<OwnedNftsResponse> = alchemy.nft.getNftsForOwner(address, { pageSize: 1 });
    // 3. 获取交易历史记录，用于计算钱包年龄和交互合约数
    const assetTransfersPromise = alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toAddress: address, // 查询作为接收方的记录来找第一次收到的资产
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155,
      ],
      maxCount: 1, // 只需要最早的一条
      order: SortingOrder.ASCENDING, // 按时间升序
    });

    const assetTransfersOutPromise = alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      fromAddress: address,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155,
      ],
      maxCount: 100, // 获取最近100条用于分析交互合约
    });

    // 等待所有API请求完成
    const [txCount, nftData, firstInTransfer, lastOutTransfers] = await Promise.all([
      txCountPromise,
      nftCountPromise,
      assetTransfersPromise,
      assetTransfersOutPromise,
    ]);

    // --- 数据分析与打标签 ---

    const tags: string[] = [];
    let walletAgeInDays = 0;

    // 规则 1: 链上新手小白 (交互次数少于5)
    if (txCount < 5) {
      tags.push("链上新手小白");
    }

    // 规则 2: NFT收藏家 (拥有NFT数量大于5)
    const nftCount = nftData.totalCount;
    if (nftCount > 5) {
      tags.push("NFT收藏家");
    }

    // 规则 3: 链上老炮 (年龄大于1年)
    if (firstInTransfer.transfers.length > 0) {
      const firstTxBlock = await alchemy.core.getBlock(firstInTransfer.transfers[0].blockNum);
      if (firstTxBlock) {
        const firstTxDate = new Date(firstTxBlock.timestamp * 1000);
        walletAgeInDays = Math.floor((new Date().getTime() - firstTxDate.getTime()) / (1000 * 3600 * 24));
        if (walletAgeInDays > 365) {
          tags.push("链上老炮");
        }
      }
    }

    // 规则 4: 探索家 (交互合约数量大于10)
    const uniqueContracts = new Set(lastOutTransfers.transfers.map(tx => tx.to).filter(Boolean)); // 使用Set自动去重, 并过滤掉null的to地址
    const uniqueContractsInteracted = uniqueContracts.size;
    if (uniqueContractsInteracted > 10) {
      tags.push("探索家");
    }

    // 如果没有任何特殊标签，则默认为“新手”
    if (tags.length === 0) {
      tags.push("链上新手小白");
    }

    return {
      transactionCount: txCount,
      walletAgeInDays,
      nftCount,
      uniqueContractsInteracted: uniqueContracts.size,
      tags,
    };
  } catch (error) {
    console.error("Failed to analyze wallet:", error);
    // 在失败时返回一个安全的默认值
    return {
      transactionCount: 0,
      walletAgeInDays: 0,
      nftCount: 0,
      uniqueContractsInteracted: 0,
      tags: ["链上新手小白"],
    };
  }
};
