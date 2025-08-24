'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBalance, useTextTo3D, useTaskStatus } from '@/hooks/use-meshy';
import { TextTo3DParams } from '@/shared/meshy/types';
import { calculateCost, estimateGenerationTime } from '@/shared/meshy/config';
import { ClientSideModel3DViewer } from '@/components/3d/ClientSideModel3DViewer';
import { NFTMintDialog } from '@/components/web3/NFTMintDialog';
import { storage } from '@/shared/storage';
import {
  Sparkles,
  Clock,
  DollarSign,
  Zap,
  Settings,
  Eye,
  Brush,
  Layers,
  RotateCcw,
  Coins
} from 'lucide-react';

interface GeneratorProps {
  onTaskCreated?: (taskId: string) => void;
}

export function TextTo3DGenerator({ onTaskCreated }: GeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'preview' | 'refine'>('preview');
  const [artStyle, setArtStyle] = useState<'realistic' | 'sculpture'>('realistic');
  const [aiModel, setAiModel] = useState<'meshy-4' | 'meshy-5'>('meshy-5');
  const [topology, setTopology] = useState<'quad' | 'triangle'>('triangle');
  const [targetPolycount, setTargetPolycount] = useState(5000);
  const [symmetryMode, setSymmetryMode] = useState<'off' | 'auto' | 'on'>('auto');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);

  // Hooks
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const textTo3DMutation = useTextTo3D();
  const { data: taskStatus } = useTaskStatus(currentTaskId);

  // 在客户端挂载时从localStorage恢复状态
  useEffect(() => {
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      // 只恢复 previewTaskId 用于 refine 模式
      // 不恢复 currentTaskId，避免旧任务干扰新任务
      const savedPreviewTask = storage.getPreviewTaskId();

      if (savedPreviewTask) {
        setPreviewTaskId(savedPreviewTask);
        console.log('🔄 Restored preview task ID:', savedPreviewTask);
      }

      // 清除可能过时的 currentTask
      storage.saveCurrentTask('');
      console.log('🧹 Cleared old current task from storage');
    }
  }, []); // 只在组件挂载时执行一次

  // 监听任务状态变化，保存成功的preview任务ID
  useEffect(() => {
    if (!taskStatus || !currentTaskId) return;

    // 只处理当前正在追踪的任务
    if (taskStatus.id !== currentTaskId) {
      console.log('🚫 Ignoring status update for old task:', taskStatus.id, 'current:', currentTaskId);
      return;
    }

    console.log('📊 Task status updated:', taskStatus.id, taskStatus.status, taskStatus.mode);

    if (taskStatus.status === 'SUCCEEDED' && taskStatus.mode === 'preview') {
      setPreviewTaskId(taskStatus.id);
      storage.savePreviewTaskId(taskStatus.id);
      console.log('✅ Preview task completed successfully, ID:', taskStatus.id);
    }

    // 只保存当前任务的成功状态
    if (taskStatus.status === 'SUCCEEDED') {
      storage.saveLastSuccessfulModel(taskStatus);
      // 新增：添加到所有成功模型列表中
      storage.addSuccessfulModel(taskStatus);
      console.log('💾 Saved successful model data for current task:', taskStatus.id);
    }
  }, [taskStatus, currentTaskId]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const params: TextTo3DParams = {
      mode,
      prompt: prompt.trim(),
      art_style: artStyle,
      ai_model: aiModel,
      topology,
      target_polycount: targetPolycount,
      symmetry_mode: symmetryMode,
    };

    // 如果是refine模式，需要添加preview_task_id
    if (mode === 'refine' && previewTaskId) {
      params.preview_task_id = previewTaskId;
    }

    // 调试日志：检查参数
    console.log('Generate params:', {
      mode,
      prompt: prompt.trim(),
      art_style: artStyle,
      ai_model: aiModel,
      topology,
      target_polycount: targetPolycount,
      symmetry_mode: symmetryMode,
      preview_task_id: params.preview_task_id,
    });

    try {
      const result = await textTo3DMutation.mutateAsync(params);
      const taskId = result.result;

      // 🔥 清除旧任务数据，设置新任务
      console.log('🔥 Starting new generation, clearing old data');
      setCurrentTaskId(taskId);
      storage.saveCurrentTask(taskId);

      // 如果是preview模式，清除旧的preview任务ID（因为要生成新的）
      if (mode === 'preview') {
        setPreviewTaskId(null);
        storage.savePreviewTaskId(''); // 清空
      }

      onTaskCreated?.(taskId);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const cost = calculateCost(mode);
  const estimatedTime = estimateGenerationTime(mode, targetPolycount);
  const canAfford = balance ? balance.balance >= cost : true;
  const canGenerate = prompt.trim() && canAfford && (mode === 'preview' || (mode === 'refine' && previewTaskId));

  return (
    <div className="space-y-6">
      {/* 余额显示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>账户余额</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>加载中...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">
                {balance?.balance || 0} Credits
              </div>
              <Badge variant={canAfford ? "default" : "destructive"}>
                {canAfford ? "余额充足" : "余额不足"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 生成参数设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>文本生成 3D 模型</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 提示词输入 */}
          <div className="space-y-2">
            <Label htmlFor="prompt">
              模型描述 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="prompt"
              placeholder="例如: A cute robot with blue eyes and metallic body"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={600}
              className="min-h-[60px]"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>使用英文描述效果更佳</span>
              <span>{prompt.length}/600 字符</span>
            </div>
          </div>

          <Separator />

          {/* 基础设置 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>生成模式</span>
              </Label>
              <Select value={mode} onValueChange={(value: 'preview' | 'refine') => setMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preview">Preview - 快速预览 (5 Credits)</SelectItem>
                  <SelectItem value="refine">Refine - 高质量纹理 (10 Credits)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Brush className="h-4 w-4" />
                <span>艺术风格</span>
              </Label>
              <Select value={artStyle} onValueChange={(value: 'realistic' | 'sculpture') => setArtStyle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">Realistic - 写实风格</SelectItem>
                  <SelectItem value="sculpture">Sculpture - 雕塑风格</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>AI 模型</span>
              </Label>
              <Select value={aiModel} onValueChange={(value: 'meshy-4' | 'meshy-5') => setAiModel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meshy-4">Meshy-4 - 稳定版本</SelectItem>
                  <SelectItem value="meshy-5">Meshy-5 - 最新版本</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Layers className="h-4 w-4" />
                <span>拓扑结构</span>
              </Label>
              <Select value={topology} onValueChange={(value: 'quad' | 'triangle') => setTopology(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="triangle">Triangle - 三角面</SelectItem>
                  <SelectItem value="quad">Quad - 四边面</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 高级设置 */}
          <div className="space-y-4">
            <Label className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>高级设置</span>
            </Label>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>目标多边形数量: {targetPolycount.toLocaleString()}</Label>
                <input
                  type="range"
                  min="100"
                  max="300000"
                  step="100"
                  value={targetPolycount}
                  onChange={(e) => setTargetPolycount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100</span>
                  <span>300,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <RotateCcw className="h-4 w-4" />
                  <span>对称性控制</span>
                </Label>
                <Select value={symmetryMode} onValueChange={(value: 'off' | 'auto' | 'on') => setSymmetryMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off - 关闭对称</SelectItem>
                    <SelectItem value="auto">Auto - 自动检测</SelectItem>
                    <SelectItem value="on">On - 强制对称</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* 费用和时间估算 */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm">费用: <strong>{cost} Credits</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">预计: <strong>{estimatedTime}秒</strong></span>
            </div>
          </div>

          {/* 生成按钮 */}
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || textTo3DMutation.isPending}
            className="w-full"
            size="lg"
          >
            {textTo3DMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                生成中...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                开始生成 3D 模型 ({mode} 模式)
              </>
            )}
          </Button>

          {/* 模式相关提示 */}
          {mode === 'refine' && !previewTaskId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 Refine模式需要先完成一个Preview任务。请先选择Preview模式生成模型，完成后再切换到Refine模式。
              </p>
            </div>
          )}

          {mode === 'refine' && previewTaskId && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ 将基于Preview任务进行精细化处理
              </p>
              <p className="text-green-700 text-xs mt-1">
                Preview任务ID: {previewTaskId}
              </p>
            </div>
          )}

          {!canAfford && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                ⚠️ 余额不足，无法生成模型。请先充值后再试。
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3D 模型预览 */}
      {currentTaskId && taskStatus && taskStatus.status === 'SUCCEEDED' && taskStatus.model_urls && (
        <ClientSideModel3DViewer taskResult={taskStatus} />
      )}

      {/* 任务状态显示 */}
      {currentTaskId && (
        <Card>
          <CardHeader>
            <CardTitle>生成进度</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>任务 ID:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {currentTaskId}
                </code>
              </div>

              {taskStatus && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>状态:</span>
                    <Badge
                      variant={
                        taskStatus.status === 'SUCCEEDED' ? 'default' :
                          taskStatus.status === 'FAILED' ? 'destructive' :
                            taskStatus.status === 'IN_PROGRESS' ? 'secondary' :
                              'outline'
                      }
                    >
                      {taskStatus.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>进度:</span>
                      <span>{taskStatus.progress}%</span>
                    </div>
                    <Progress value={taskStatus.progress} className="w-full" />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>创建时间:</span>
                    <span>{new Date(taskStatus.created_at).toLocaleString()}</span>
                  </div>

                  {taskStatus.status === 'SUCCEEDED' && taskStatus.model_urls && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 space-y-3">
                      <h4 className="font-medium text-green-800 mb-2">✅ 生成成功！</h4>
                      <p className="text-green-700 text-sm">
                        3D 模型已生成完成，您可以在上方查看预览并下载模型文件。
                      </p>

                      {/* NFT铸造按钮 */}
                      <div className="flex items-center justify-between pt-3 border-t border-green-200">
                        <div className="flex items-center space-x-2 text-sm text-green-700">
                          <Coins className="h-4 w-4" />
                          <span>将您的3D模型铸造为NFT</span>
                        </div>
                        <NFTMintDialog
                          taskResult={taskStatus}
                          trigger={
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Coins className="h-4 w-4 mr-2" />
                              铸造NFT
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  )}

                  {taskStatus.status === 'FAILED' && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">❌ 生成失败</h4>
                      <p className="text-red-700 text-sm">
                        {taskStatus.task_error || '未知错误'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}