import Image from "next/image";
import { NFTItem } from "~~/types/nft";

interface NFTDetailModalProps {
  nft: NFTItem | null;
  onClose: () => void;
  formatDate: (dateString: string) => string;
  openInNewTab: (url: string) => void;
}

export const NFTDetailModal: React.FC<NFTDetailModalProps> = ({ nft, onClose, formatDate, openInNewTab }) => {
  if (!nft) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Weather NFT #{nft.tokenId}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Image
              src={nft.imageUrl}
              alt={`Weather NFT #${nft.tokenId}`}
              width={300}
              height={400}
              className="w-full rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">📊 NFT信息</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Token ID:</span>
                  <span className="font-mono">#{nft.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span>城市:</span>
                  <span>{nft.city}</span>
                </div>
                <div className="flex justify-between">
                  <span>日期:</span>
                  <span>{formatDate(nft.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>天气:</span>
                  <span>{nft.weather}</span>
                </div>
                <div className="flex justify-between">
                  <span>温度:</span>
                  <span>{nft.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>时段:</span>
                  <span>{nft.timeOfDay}</span>
                </div>
                <div className="flex justify-between">
                  <span>铸造者:</span>
                  <span className="font-mono text-xs">{nft.minter}</span>
                </div>
                <div className="flex justify-between">
                  <span>铸造时间:</span>
                  <span>{new Date(nft.timestamp * 1000).toLocaleString("zh-CN")}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">🔗 外部链接</h4>
              <div className="space-y-2">
                <button className="btn btn-outline btn-sm w-full" onClick={() => openInNewTab(nft.metadataUrl)}>
                  查看IPFS元数据
                </button>
                <button
                  className="btn btn-outline btn-sm w-full"
                  onClick={() => openInNewTab(`https://etherscan.io/token/CONTRACT_ADDRESS?a=${nft.tokenId}`)}
                >
                  在Etherscan查看
                </button>
                <button
                  className="btn btn-outline btn-sm w-full"
                  onClick={() => openInNewTab(`https://opensea.io/assets/ethereum/CONTRACT_ADDRESS/${nft.tokenId}`)}
                >
                  在OpenSea查看
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
