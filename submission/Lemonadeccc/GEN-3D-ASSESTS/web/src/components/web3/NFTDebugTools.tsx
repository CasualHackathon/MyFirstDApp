'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAccount, useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/shared/contracts/asset3dnft';
import {
  Bug,
  ExternalLink,
  Wallet,
  Network,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export function NFTDebugTools() {
  const [tokenId, setTokenId] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.ASSET3D_NFT;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const addNFTToMetaMask = async () => {
    if (!tokenId || !contractAddress) return;

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC721',
            options: {
              address: contractAddress,
              tokenId: tokenId,
            },
          },
        });
        toast.success('NFT添加请求已发送到MetaMask');
      }
    } catch (error) {
      console.error('添加到MetaMask失败:', error);
      toast.error('添加到MetaMask失败');
    }
  };

  const checkNFTMetadata = async () => {
    if (!tokenId || !contractAddress) return;

    setIsChecking(true);
    try {
      // 这里可以添加检查NFT元数据的逻辑
      const etherscanUrl = `https://sepolia.etherscan.io/token/${contractAddress}?a=${tokenId}`;
      const openseaUrl = `https://testnets.opensea.io/assets/sepolia/${contractAddress}/${tokenId}`;

      setDebugResults({
        contractAddress,
        tokenId,
        etherscanUrl,
        openseaUrl,
        chainId,
        chainName: chainId === 11155111 ? 'Sepolia Testnet' : 'Unknown',
        timestamp: new Date().toISOString(),
      });

      toast.success('调试信息已更新');
    } catch (error) {
      console.error('检查失败:', error);
      toast.error('检查NFT信息失败');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-neutral-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-neutral-900">
          <Bug className="h-5 w-5" />
          <span>NFT 调试工具</span>
        </CardTitle>
        <p className="text-sm text-neutral-600">
          帮助诊断NFT在MetaMask中的显示问题
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 网络状态 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">网络状态</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{isConnected ? '已连接' : '未连接'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Network className="w-4 h-4" />
              <span className="text-sm">
                {chainId === 11155111 ? 'Sepolia' : `链 ${chainId}`}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* 合约信息 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">合约信息</Label>
          <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-600">合约地址:</span>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-white px-2 py-1 rounded">
                  {contractAddress ? `${contractAddress.slice(0, 8)}...${contractAddress.slice(-6)}` : '未部署'}
                </code>
                {contractAddress && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(contractAddress)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-600">链ID:</span>
              <Badge variant="outline">{chainId}</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* NFT检查工具 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">NFT 检查</Label>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="tokenId" className="text-xs">Token ID</Label>
              <Input
                id="tokenId"
                placeholder="输入 NFT Token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={checkNFTMetadata}
                disabled={!tokenId || !contractAddress || isChecking}
                size="sm"
                className="flex-1"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    检查中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    检查 NFT
                  </>
                )}
              </Button>

              <Button
                onClick={addNFTToMetaMask}
                disabled={!tokenId || !contractAddress}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <Wallet className="h-4 w-4 mr-2" />
                添加到MetaMask
              </Button>
            </div>
          </div>
        </div>

        {/* 调试结果 */}
        {debugResults && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium">调试结果</Label>
              <div className="bg-neutral-50 rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-600">Token ID:</span>
                    <div className="font-mono">{debugResults.tokenId}</div>
                  </div>
                  <div>
                    <span className="text-neutral-600">检查时间:</span>
                    <div>{new Date(debugResults.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start h-8"
                    onClick={() => window.open(debugResults.etherscanUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    在 Etherscan 上查看
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start h-8"
                    onClick={() => window.open(debugResults.openseaUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    在 OpenSea 测试网查看
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* 故障排除建议 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">故障排除建议</Label>
          <div className="space-y-2 text-xs text-neutral-600">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-neutral-900">如果MetaMask中看不到NFT:</div>
                <div>1. 确保已切换到正确的网络(Sepolia测试网)</div>
                <div>2. 等待几分钟让区块链索引NFT数据</div>
                <div>3. 使用上面的&ldquo;添加到MetaMask&rdquo;按钮手动添加</div>
                <div>4. 在OpenSea测试网上查看是否显示正常</div>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-neutral-900">如果交易成功:</div>
                <div>NFT已经铸造成功，只是显示可能需要时间</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}