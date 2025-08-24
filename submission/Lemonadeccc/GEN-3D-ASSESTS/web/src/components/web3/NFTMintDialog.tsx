'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TaskStatusResponse } from '@/shared/meshy/types';
import { useNFTMint } from '@/hooks/use-nft-mint';
import { useAccount } from 'wagmi';
import { ExternalLink, Wallet, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '@/shared/storage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface NFTMintDialogProps {
  taskResult: TaskStatusResponse;
  trigger: React.ReactNode;
  onMintSuccess?: (hash: string) => void;
}

export function NFTMintDialog({ taskResult, trigger, onMintSuccess }: NFTMintDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [royaltyBps, setRoyaltyBps] = useState(250); // 2.5%
  const [isOpen, setIsOpen] = useState(false);

  const { isConnected, chainId } = useAccount();
  const { mintNFT, resetState, isLoading, currentStep, hash, isSuccess } = useNFTMint();
  const isSepolia = chainId === 11155111;

  const handleMint = async () => {
    if (!name.trim()) {
      return;
    }

    await mintNFT({
      name: name.trim(),
      description: description.trim(),
      taskResult,
      royaltyBps,
    });
  };

  const handleSuccess = () => {
    setName('');
    setDescription('');
    setRoyaltyBps(250);
  };

  // 成功时清理表单但不关闭对话框，并调用回调
  useEffect(() => {
    if (isSuccess && hash) {
      handleSuccess();

      // 标记模型为已铸造
      storage.markModelAsMinted(taskResult.id, {
        tokenId: 0, // 这里暂时用0，实际应该从合约事件获取tokenId
        transactionHash: hash
      });

      onMintSuccess?.(hash);
    }
  }, [isSuccess, hash, onMintSuccess, taskResult.id]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Mint 3D NFT</span>
          </DialogTitle>
          <DialogDescription>
            Fill out the NFT details, click Mint, and confirm in your wallet.
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Please connect your wallet to mint</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 网络检查提示 */}
            {!isSepolia && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Please switch to Sepolia</AlertTitle>
                <AlertDescription>
                  The current network is not supported. Switch to Sepolia in MetaMask and try again.
                </AlertDescription>
              </Alert>
            )}
            {/* 模型信息 */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">3D Model</Label>
                <Badge variant="secondary">{taskResult.mode}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Task ID: {taskResult.id}
              </div>
              {taskResult.polycount && (
                <div className="text-sm text-muted-foreground">
                  Polycount: {taskResult.polycount.toLocaleString()}
                </div>
              )}
            </div>

            {/* NFT 信息表单 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">NFT Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter NFT name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your 3D NFT..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="royalty">Royalty (%)</Label>
                <Input
                  id="royalty"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={royaltyBps / 100}
                  onChange={(e) => setRoyaltyBps(Math.round(parseFloat(e.target.value) * 100))}
                  disabled={isLoading}
                />
                <div className="text-xs text-muted-foreground">
                  Set secondary sale royalty (0-10%)
                </div>
              </div>
            </div>

            {/* 进度显示 */}
            {isLoading && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Minting Progress</span>
                  <span className="text-muted-foreground">{currentStep}</span>
                </div>

                {/* 步骤进度条 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Preparing</span>
                    <span>Upload IPFS</span>
                    <span>Send Tx</span>
                    <span>Confirm</span>
                  </div>

                  {/* 动态进度条 */}
                  <Progress
                    value={
                      currentStep.toLowerCase().includes('prepare') ? 25 :
                        currentStep.includes('IPFS') ? 50 :
                          currentStep.toLowerCase().includes('send') || currentStep.toLowerCase().includes('wallet') ? 75 :
                            currentStep.toLowerCase().includes('confirm') ? 90 :
                              10
                    }
                    className="w-full"
                  />
                </div>

                {/* 提示信息 */}
                <div className="text-xs text-muted-foreground text-center">
                  {currentStep.toLowerCase().includes('wallet') && (
                    <span className="text-orange-600">Please confirm the transaction in your wallet</span>
                  )}
                  {currentStep.toLowerCase().includes('confirm') && (
                    <span className="text-blue-600">Transaction confirming on-chain, please wait...</span>
                  )}
                  {currentStep.includes('IPFS') && (
                    <span>Uploading metadata to IPFS...</span>
                  )}
                </div>

                {/* 取消铸造按钮 */}
                {isLoading && !currentStep.includes('确认') && (
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        resetState();
                        toast.info('Mint cancelled');
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel mint
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* 成功状态 */}
            {isSuccess && hash && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">Mint successful!</span>
                </div>
                <div className="text-xs text-green-600 mb-2">
                  Tx hash: {hash.slice(0, 10)}...{hash.slice(-8)}
                </div>

                {/* 操作指引 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-green-800">Next steps:</div>
                  <div className="text-xs text-green-700 space-y-1">
                    <div>• View the transaction in a block explorer</div>
                    <div>• Go to the NFT page to view your collection</div>
                    <div>• If not visible in MetaMask, add it manually</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Transaction
                  </Button>

                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMint}
                disabled={!name.trim() || isLoading || !isSepolia}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin 
  mr-2" />
                    Minting...
                  </>
                ) : (
                  (!isSepolia ? 'Switch to Sepolia first' : 'Mint NFT')
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
