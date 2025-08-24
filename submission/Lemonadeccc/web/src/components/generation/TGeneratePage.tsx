'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBalance, useTextTo3D, useTaskStatus, useTextToTexture, useTextureTaskStatus } from '@/hooks/use-meshy';
import { TextTo3DParams, TaskStatusResponse } from '@/shared/meshy/types';
import { DirectModelViewer } from '@/components/3d/DirectModelViewer';
import { SimpleCubeScene } from '@/components/3d/RotatingCube';
import { storage } from '@/shared/storage';
import { z } from 'zod';
import {
  Sparkles,
  Image,
  Layers,
  Play,
  FileText,
  Settings,
  Eye,
  Download,
  Coins,
  Loader2,
  Palette
} from 'lucide-react';
import { NFTMintDialog } from '@/components/web3/NFTMintDialog';
import { useLogoAnimation } from '@/store/logoAnimationStore';

// Zod schema for prompt validation
const promptSchema = z.string()
  .min(3, "Prompt must be at least 3 characters long")
  .max(600, "Prompt must be 600 characters or less");

interface TGeneratePageProps {
  onTaskCreated?: (taskId: string) => void;
}

export function TGeneratePage({ onTaskCreated }: TGeneratePageProps) {
  // State management
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'multi'>('text');
  const [prompt, setPrompt] = useState('');
  const [promptError, setPromptError] = useState<string>('');
  const [mode, setMode] = useState<'preview' | 'refine'>('preview');
  const [artStyle, setArtStyle] = useState<'realistic' | 'sculpture'>('realistic');
  const [aiModel, setAiModel] = useState<'meshy-4' | 'meshy-5'>('meshy-5');
  const [targetPolycount, setTargetPolycount] = useState(50000);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // 修改为支持模型和纹理的数据结构
  interface GenerationItem {
    id: string;
    type: 'model' | 'texture';
    parentModelId?: string; // 纹理对应的模型ID
    status?: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'; // 任务状态
    timestamp: number;
  }
  const [generatedTasks, setGeneratedTasks] = useState<GenerationItem[]>([]);

  // 用于存储任务状态的映射
  const [taskStatusMap, setTaskStatusMap] = useState<Map<string, string>>(new Map());

  // 纹理生成相关状态
  const [showTextureDialog, setShowTextureDialog] = useState(false);
  const [textureTaskId, setTextureTaskId] = useState<string | null>(null);
  const [texturePrompt, setTexturePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [enablePbr, setEnablePbr] = useState(true);

  // NFT铸造状态
  const [nftMintHash, setNftMintHash] = useState<string | null>(null);
  const [isNftMinted, setIsNftMinted] = useState<boolean>(false);

  // Hooks
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const textTo3DMutation = useTextTo3D();
  const textToTextureMutation = useTextToTexture();
  const { data: taskStatus } = useTaskStatus(currentTaskId) as { data: TaskStatusResponse | undefined };
  const { data: textureTaskStatus } = useTextureTaskStatus(textureTaskId);

  // Logo动画集成 - 监听生成状态和进度
  useEffect(() => {
    const logoStore = useLogoAnimation.getState();
    const modelProgress = taskStatus?.progress || 0;
    const textureProgress = textureTaskStatus?.progress || 0;

    // 判断是否有任务正在进行
    const isModelGenerating = isGenerating;
    const isTextureGenerating = textureTaskStatus?.status === 'IN_PROGRESS' || textureTaskStatus?.status === 'PENDING';
    const anyGenerating = isModelGenerating || isTextureGenerating;

    // 使用最高的进度值
    const maxProgress = Math.max(modelProgress, textureProgress);

    logoStore.setAPIState(anyGenerating, maxProgress);
  }, [isGenerating, taskStatus?.progress, textureTaskStatus?.status, textureTaskStatus?.progress]);

  // NFT铸造成功处理
  const handleNftMintSuccess = (hash: string) => {
    setNftMintHash(hash);
    setIsNftMinted(true);
    console.log('NFT minted successfully:', hash);
  };

  // Validate prompt on change
  const handlePromptChange = (value: string) => {
    setPrompt(value);
    try {
      promptSchema.parse(value);
      setPromptError('');
    } catch (error) {
      if (error instanceof z.ZodError && error.issues && error.issues.length > 0) {
        setPromptError(error.issues[0].message);
      } else {
        setPromptError('Invalid input');
      }
    }
  };

  // Load saved state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreviewTask = storage.getPreviewTaskId();
      if (savedPreviewTask) {
        setPreviewTaskId(savedPreviewTask);
      }

      // Load generation history
      const historyStr = localStorage.getItem('generationHistory');
      if (historyStr) {
        try {
          const history = JSON.parse(historyStr) as GenerationItem[];
          setGeneratedTasks(history.slice(-20)); // Keep last 20 items
        } catch {
          // 兼容旧格式
          const history = storage.getGenerationHistory();
          const items: GenerationItem[] = history.map(id => ({
            id,
            type: 'model' as const,
            timestamp: Date.now()
          }));
          setGeneratedTasks(items.slice(-20));
        }
      }
    }
  }, []);

  // Handle task status updates - 更新任务状态映射
  useEffect(() => {
    if (taskStatus) {
      setTaskStatusMap(prev => {
        const newMap = new Map(prev);
        newMap.set(taskStatus.id, taskStatus.status);
        return newMap;
      });

      // 更新历史记录中的状态
      setGeneratedTasks(prev =>
        prev.map(item =>
          item.id === taskStatus.id
            ? { ...item, status: taskStatus.status as any }
            : item
        )
      );
    }
  }, [taskStatus]);

  // 当切换任务时重置NFT状态
  useEffect(() => {
    if (currentTaskId) {
      // 如果切换到新任务，重置NFT铸造状态
      setIsNftMinted(false);
      setNftMintHash(null);
    }
  }, [currentTaskId]);



  // Handle texture task status updates
  useEffect(() => {
    if (textureTaskStatus) {
      setTaskStatusMap(prev => {
        const newMap = new Map(prev);
        newMap.set(textureTaskStatus.id, textureTaskStatus.status);
        return newMap;
      });

      // 更新历史记录中的状态
      setGeneratedTasks(prev =>
        prev.map(item =>
          item.id === textureTaskStatus.id
            ? { ...item, status: textureTaskStatus.status as any }
            : item
        )
      );
    }
  }, [textureTaskStatus]);
  useEffect(() => {
    if (!taskStatus || !currentTaskId) return;

    if (taskStatus.id === currentTaskId) {
      if (taskStatus.status === 'SUCCEEDED' && taskStatus.mode === 'preview') {
        setPreviewTaskId(taskStatus.id);
        storage.savePreviewTaskId(taskStatus.id);
      }

      if (taskStatus.status === 'SUCCEEDED') {
        storage.saveLastSuccessfulModel(taskStatus);
        setIsGenerating(false);
      }

      if (taskStatus.status === 'FAILED') {
        setIsGenerating(false);
      }
    }
  }, [taskStatus, currentTaskId]);

  // Generate 3D model
  const handleGenerate = async () => {
    // Validate prompt before generating
    try {
      promptSchema.parse(prompt);
    } catch (error) {
      if (error instanceof z.ZodError && error.issues && error.issues.length > 0) {
        setPromptError(error.issues[0].message);
        return;
      } else {
        setPromptError('Invalid input');
        return;
      }
    }

    setIsGenerating(true);

    const params: TextTo3DParams = {
      prompt: prompt.trim(),
      mode,
      art_style: artStyle,
      ai_model: aiModel,
      target_polycount: targetPolycount,
      preview_task_id: mode === 'refine' ? (previewTaskId ?? undefined) : undefined,
    };

    try {
      const result = await textTo3DMutation.mutateAsync(params);

      if (result?.result) {
        const taskId = result.result;
        setCurrentTaskId(taskId);

        // Update history with model task
        const newItem: GenerationItem = {
          id: taskId,
          type: 'model',
          status: 'PENDING',
          timestamp: Date.now()
        };
        const newHistory = [...generatedTasks, newItem];
        setGeneratedTasks(newHistory.slice(-20));
        localStorage.setItem('generationHistory', JSON.stringify(newHistory));

        onTaskCreated?.(taskId);
        console.log('✅ Generation started:', taskId);
      }
    } catch (error) {
      console.error('❌ Generation failed:', error);
      setIsGenerating(false);
    }
  };

  // 智能选择最佳模型进行铸造 - 简化版，只依赖主要任务状态
  const getBestModelForMint = () => {
    if (taskStatus && taskStatus.status === 'SUCCEEDED') {
      return {
        taskResult: taskStatus,
        type: 'base',
        label: 'Mint NFT'
      };
    }
    return null;
  };

  const bestModel = getBestModelForMint();

  // 纹理生成处理
  const handleTextureGenerate = async () => {
    if (!taskStatus?.model_urls?.glb || !texturePrompt.trim()) return;

    try {
      const result = await textToTextureMutation.mutateAsync({
        model_url: taskStatus.model_urls.glb,
        prompt: texturePrompt.trim(),
        text_style_prompt: negativePrompt.trim() || undefined,
        enable_pbr: enablePbr,
        ai_model: 'meshy-5'
      });

      if (result.result) {
        setTextureTaskId(result.result);
        storage.saveTextureTaskId(result.result);
        console.log('纹理生成任务启动:', result.result);

        // Add texture to history
        const newItem: GenerationItem = {
          id: result.result,
          type: 'texture',
          parentModelId: taskStatus?.id,
          status: 'PENDING',
          timestamp: Date.now()
        };
        const newHistory = [...generatedTasks, newItem];
        setGeneratedTasks(newHistory.slice(-20));
        localStorage.setItem('generationHistory', JSON.stringify(newHistory));
      }

      setShowTextureDialog(false);
      setTexturePrompt('');
      setNegativePrompt('');
    } catch (error) {
      console.error('纹理生成启动失败:', error);
    }
  };

  return (
    <div className="w-full h-screen flex bg-black text-white overflow-hidden">
      {/* Left Panel - 33% */}
      <div className="w-1/3 p-6 space-y-6 overflow-y-auto h-[798px]">
        {/* Generation Type Tabs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Generation Type</h2>
          <div className="flex flex-col gap-2">
            <Button
              variant={activeTab === 'text' ? 'default' : 'outline'}
              onClick={() => setActiveTab('text')}
              className="justify-start"
            >
              <FileText className="mr-2 h-4 w-4" />
              Text to 3D
            </Button>
            <Button
              variant={activeTab === 'image' ? 'default' : 'outline'}
              onClick={() => setActiveTab('image')}
              className="justify-start border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-300 disabled:border-gray-700 disabled:text-gray-500 disabled:bg-gray-800/50"
              disabled
            >
              <Image className="mr-2 h-4 w-4" />
              Image to 3D
              <Badge variant="secondary" className="ml-auto text-xs bg-gray-700 text-gray-400 border-gray-600">Soon</Badge>
            </Button>
            <Button
              variant={activeTab === 'multi' ? 'default' : 'outline'}
              onClick={() => setActiveTab('multi')}
              className="justify-start border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-300 disabled:border-gray-700 disabled:text-gray-500 disabled:bg-gray-800/50"
              disabled
            >
              <Layers className="mr-2 h-4 w-4" />
              Multi-Image
              <Badge variant="secondary" className="ml-auto text-xs bg-gray-700 text-gray-400 border-gray-600">Soon</Badge>
            </Button>
          </div>
        </div>

        {/* Text Input */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Model Description</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="Describe your 3D model in detail..."
                className="h-[178px] resize-none"
                maxLength={600}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{promptError && <span className="text-red-500">{promptError}</span>}</span>
                <span>{prompt.length}/600</span>
              </div>
            </div>

            {/* Parameters - 2x2 Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Parameters</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Mode</Label>
                  <Select value={mode} onValueChange={(value: 'preview' | 'refine') => setMode(value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preview">Preview</SelectItem>
                      <SelectItem value="refine" disabled={!previewTaskId}>
                        Refine
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Style</Label>
                  <Select value={artStyle} onValueChange={(value: 'realistic' | 'sculpture') => setArtStyle(value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="sculpture">Sculpture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">AI Model</Label>
                  <Select value={aiModel} onValueChange={(value: 'meshy-4' | 'meshy-5') => setAiModel(value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meshy-5">Meshy-5</SelectItem>
                      <SelectItem value="meshy-4">Meshy-4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Polycount</Label>
                  <Select
                    value={targetPolycount.toString()}
                    onValueChange={(value) => setTargetPolycount(parseInt(value))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5000">5K</SelectItem>
                      <SelectItem value="10000">10K</SelectItem>
                      <SelectItem value="20000">20K</SelectItem>
                      <SelectItem value="50000">50K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status info - Always show */}
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span>Model Status:</span>
                  <Badge variant={taskStatus?.status === 'SUCCEEDED' ? 'default' : 'secondary'}>
                    {taskStatus?.status || 'IDLE'}
                  </Badge>
                </div>

                {/* 根据状态显示不同内容 */}
                {taskStatus?.status === 'SUCCEEDED' ? (
                  // 完成时显示Task ID - 添加padding匹配Progress高度
                  <div className="py-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Task ID:</span>
                      <span className="text-xs text-gray-400 font-mono">
                        {taskStatus.id ? `${taskStatus.id.slice(0, 12)}...` : ''}
                      </span>
                    </div>
                  </div>
                ) : (
                  // 未完成时显示进度条
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{taskStatus?.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-1.5">
                      <div
                        className="bg-blue-700 h-1.5 rounded-full transition-all"
                        style={{ width: `${taskStatus?.progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating || !!promptError}
              className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold shadow-lg disabled:bg-gray-600 disabled:text-gray-400"
              size="lg"
            >
              <Play className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Model'}
            </Button>

          </div>
        )}
      </div>

      {/* Middle Panel - 33% */}
      <div className="w-1/3 p-6 border-l border-r border-gray-700 space-y-4 overflow-y-auto h-[798px]">
        {/* 3D Model Preview - 减少高度，为下方元素留出空间 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">3D Model Preview</h2>
          <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden" style={{ height: '549px' }}>
            {taskStatus && taskStatus.status === 'SUCCEEDED' ? (
              <DirectModelViewer
                taskResult={taskStatus}
                className="w-full h-full rounded-lg"
                textureModelUrl={textureTaskStatus?.status === 'SUCCEEDED' ? textureTaskStatus?.model_urls?.glb : undefined}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 flex items-center">
                  <span className="text-sm text-white">Waiting for model...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Texture Status Info - 与左侧Status保持一致的位置和样式 */}
        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span>Texture Status:</span>
              <Badge variant={textureTaskStatus?.status === 'SUCCEEDED' ? 'default' : 'secondary'}>
                {textureTaskStatus?.status || 'NOT STARTED'}
              </Badge>
            </div>

            {/* 根据纹理状态显示不同内容 */}
            {textureTaskStatus?.status === 'SUCCEEDED' ? (
              // 纹理完成时显示Texture ID - 添加padding匹配Progress高度
              <div className="py-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Texture ID:</span>
                  <span className="text-xs text-gray-400 font-mono">
                    {textureTaskStatus.id ? `${textureTaskStatus.id.slice(0, 12)}...` : ''}
                  </span>
                </div>
              </div>
            ) : (
              // 未完成时显示进度条
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{textureTaskStatus?.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1.5">
                  <div
                    className="bg-blue-700 h-1.5 rounded-full transition-all"
                    style={{ width: `${textureTaskStatus?.progress || 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Texture Button - 与左侧Generate按钮对齐 */}
        <Button
          onClick={() => setShowTextureDialog(true)}
          disabled={!taskStatus || taskStatus.status !== 'SUCCEEDED' || !taskStatus?.model_urls?.glb || textureTaskStatus?.status === 'IN_PROGRESS'}
          className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold shadow-lg disabled:bg-gray-600 disabled:text-gray-400"
          size="lg"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {textureTaskStatus?.status === 'IN_PROGRESS' ? 'Generating...' : 'Generate Texture'}
        </Button>
      </div>

      {/* Right Panel - 33% */}
      <div className="w-1/3 border-l border-gray-700 flex flex-col h-[798px]">
        {/* Generation History Title */}
        <div className="p-6 pb-0 mb-4">
          <h2 className="text-lg font-semibold text-white">Generation History</h2>
        </div>

        {/* Generation History Content */}
        <div className="p-6 pt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 mb-4" style={{ height: '549px' }}>

          {generatedTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
              <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <p>No generations yet</p>
              <p className="text-sm">Start creating your first 3D model!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {generatedTasks.slice().reverse().map((item, index) => {
                // 获取当前状态（从map或item中）
                const currentStatus = taskStatusMap.get(item.id) || item.status;
                // 判断是否激活
                const isActive = (item.type === 'model' && currentTaskId === item.id && !textureTaskId) ||
                  (item.type === 'texture' && textureTaskId === item.id);

                // 如果是纹理，找到对应模型的正确显示编号
                let modelDisplayNumber = null;
                if (item.type === 'texture' && item.parentModelId) {
                  // 在整个列表中找到父模型的索引位置
                  const parentModelIndex = generatedTasks.findIndex(t => t.id === item.parentModelId);
                  if (parentModelIndex !== -1) {
                    // 计算父模型的显示编号（从后往前数）
                    modelDisplayNumber = generatedTasks.length - parentModelIndex;
                    console.log('Debug: parentModelId=', item.parentModelId, 'parentModelIndex=', parentModelIndex, 'displayNumber=', modelDisplayNumber);
                  }
                }

                return (
                  <div
                    key={`${item.id}-${item.timestamp}`}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${isActive
                      ? 'bg-gray-700 border-blue-600'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700/70'
                      }`}
                    onClick={() => {
                      if (item.type === 'model') {
                        // 点击模型时，只加载白模
                        setCurrentTaskId(item.id);
                        setTextureTaskId(null); // 清除纹理
                        storage.saveTextureTaskId(''); // 清除localStorage中的纹理ID
                        console.log('Loading model:', item.id);
                      } else if (item.type === 'texture' && item.parentModelId) {
                        // 点击纹理时，加载对应的模型和纹理
                        setCurrentTaskId(item.parentModelId);
                        setTextureTaskId(item.id);
                        storage.saveTextureTaskId(item.id); // 保存纹理ID到localStorage
                        console.log('Loading texture:', item.id, 'with model:', item.parentModelId);
                      }
                    }}
                  >
                    <div className="space-y-2">
                      {/* Model类型：一行显示编号和ID，右侧Badge */}
                      {item.type === 'model' ? (
                        <>
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <code className="text-xs text-gray-300 break-all">
                                #{generatedTasks.length - index} {item.id}
                              </code>
                            </div>
                            <Badge variant="outline" className="text-xs text-white border-gray-500 ml-2 flex-shrink-0">
                              Model
                            </Badge>
                          </div>
                          {/* 状态Badge - Model类型单独一行 */}
                          <div className="flex justify-end">
                            <Badge
                              variant={
                                currentStatus === 'SUCCEEDED' ? 'default' :
                                  currentStatus === 'FAILED' ? 'destructive' :
                                    currentStatus === 'IN_PROGRESS' ? 'secondary' :
                                      currentStatus === 'PENDING' ? 'secondary' :
                                        'outline'
                              }
                              className="text-xs"
                            >
                              {currentStatus || 'IDLE'}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Texture类型：第一行编号和ID + Badge */}
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <code className="text-xs text-gray-300 break-all">
                                #{generatedTasks.length - index} {item.id}
                              </code>
                            </div>
                            <Badge variant="outline" className="text-xs text-white border-gray-500 ml-2 flex-shrink-0">
                              Texture
                            </Badge>
                          </div>
                          {/* 第二行：父模型信息和状态Badge */}
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              {item.parentModelId && modelDisplayNumber && (
                                <div className="text-xs text-gray-400">
                                  (Model: #{modelDisplayNumber} - {item.parentModelId})
                                </div>
                              )}
                            </div>
                            <Badge
                              variant={
                                currentStatus === 'SUCCEEDED' ? 'default' :
                                  currentStatus === 'FAILED' ? 'destructive' :
                                    currentStatus === 'IN_PROGRESS' ? 'secondary' :
                                      currentStatus === 'PENDING' ? 'secondary' :
                                        'outline'
                              }
                              className="text-xs ml-2 flex-shrink-0"
                            >
                              {currentStatus || 'IDLE'}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* NFT Status Info - 中间部分 */}
        <div className="flex-shrink-0 p-6 pt-0 pb-0 mb-4">
          <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-sm space-y-2">
              <div className="flex justify-between items-center">
                <span>NFT Status:</span>
                <Badge variant={isNftMinted ? 'default' : taskStatus?.status === 'SUCCEEDED' ? 'default' : 'secondary'}>
                  {isNftMinted ? 'MINTED' : taskStatus?.status === 'SUCCEEDED' ? 'READY TO MINT' : 'NOT READY'}
                </Badge>
              </div>

              {/* 显示模型信息或交易信息 */}
              <div className="py-2">
                {isNftMinted && nftMintHash ? (
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Transaction Hash:</span>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-6 px-2 text-xs bg-blue-700 hover:bg-blue-600 text-white"
                      onClick={() => window.open(`https://sepolia.etherscan.io/tx/${nftMintHash}`, '_blank')}
                    >
                      View Transaction
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Model ID:</span>
                    <span className="text-xs text-gray-400 font-mono">
                      {taskStatus?.id ? `${taskStatus.id.slice(0, 12)}...` : 'No model selected'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mint NFT Button - 最下面 */}
        <div className="flex-shrink-0 px-6 pb-0">
          {isNftMinted ? (
            <Button
              className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold shadow-lg"
              size="lg"
              onClick={() => window.location.href = '/nft'}
            >
              <Coins className="mr-2 h-4 w-4" />
              View My NFTs
            </Button>
          ) : taskStatus && taskStatus.status === 'SUCCEEDED' ? (
            <NFTMintDialog
              taskResult={taskStatus}
              onMintSuccess={handleNftMintSuccess}
              trigger={
                <Button
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold shadow-lg"
                  size="lg"
                >
                  <Coins className="mr-2 h-4 w-4" />
                  Mint NFT
                </Button>
              }
            />
          ) : (
            <Button
              className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold shadow-lg disabled:bg-gray-600 disabled:text-gray-400"
              size="lg"
              disabled={true}
            >
              <Coins className="mr-2 h-4 w-4" />
              Mint NFT
            </Button>
          )}
        </div>
      </div>

      {/* 纹理生成对话框 */}
      <Dialog open={showTextureDialog} onOpenChange={setShowTextureDialog}>
        <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Generate Texture
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="texture-prompt">Texture Description</Label>
              <Textarea
                id="texture-prompt"
                placeholder="e.g., metallic surface, wood grain, rainbow colors..."
                value={texturePrompt}
                onChange={(e) => setTexturePrompt(e.target.value)}
                maxLength={600}
                className="min-h-[80px]"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <div className="text-xs text-muted-foreground text-right">
                {texturePrompt.length}/600 chars
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style-prompt">Style Prompt (optional)</Label>
              <Input
                id="style-prompt"
                placeholder="e.g., red fangs, samurai armor..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enable-pbr"
                checked={enablePbr}
                onChange={(e) => setEnablePbr(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="enable-pbr" className="text-sm">
                Generate PBR material maps (high quality)
              </Label>
            </div>

            {/* 纹理任务状态显示 */}
            {textureTaskStatus && (
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <Badge variant={textureTaskStatus.status === 'SUCCEEDED' ? 'default' : 'secondary'}>
                      {textureTaskStatus.status}
                    </Badge>
                  </div>
                  {textureTaskStatus.status === 'IN_PROGRESS' && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{textureTaskStatus.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-1.5">
                        <div
                          className="bg-purple-700 h-1.5 rounded-full transition-all"
                          style={{ width: `${textureTaskStatus.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTextureDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleTextureGenerate}
              disabled={!texturePrompt.trim() || textToTextureMutation.isPending}
            >
              {textToTextureMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                'Start Generate'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
