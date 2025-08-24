'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useFBX, Environment } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  Eye,
  RotateCcw,
  Maximize,
  Loader2,
  Box,
  Info,
  AlertTriangle
} from 'lucide-react';
import { TaskStatusResponse } from '@/shared/meshy/types';
import { useModelDownload } from '@/hooks/use-model-download';

// GLB模型组件
function GLBModel({ url, onLoad, onError }: { url: string; onLoad: () => void; onError: (error: any) => void }) {
  const modelRef = useRef<any>(null);

  try {
    const { scene } = useGLTF(url);

    useEffect(() => {
      if (scene) {
        console.log('GLB model loaded successfully:', url);
        onLoad();
      }
    }, [scene, onLoad, url]);

    useFrame(() => {
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.01;
      }
    });

    return <primitive ref={modelRef} object={scene} scale={1} />;
  } catch (error) {
    useEffect(() => {
      onError(error);
    }, [error, onError]);
    return null;
  }
}

// FBX模型组件
function FBXModel({ url, onLoad, onError }: { url: string; onLoad: () => void; onError: (error: any) => void }) {
  const modelRef = useRef<any>(null);

  try {
    const fbx = useFBX(url);

    useEffect(() => {
      if (fbx) {
        onLoad();
      }
    }, [fbx, onLoad]);

    useFrame(() => {
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.01;
      }
    });

    return <primitive ref={modelRef} object={fbx} scale={0.01} />;
  } catch (error) {
    useEffect(() => {
      onError(error);
    }, [error, onError]);
    return null;
  }
}

// 后备模型
function FallbackModel() {
  const meshRef = useRef<any>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  );
}

interface Model3DViewerProps {
  taskResult: TaskStatusResponse;
  className?: string;
}

export function Model3DViewer({ taskResult, className }: Model3DViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'downloading' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [localModelUrl, setLocalModelUrl] = useState<string | null>(null);
  const [currentFormat, setCurrentFormat] = useState<'GLB' | 'FBX' | null>(null);

  const { downloadModel, getDownloadState } = useModelDownload();

  // 选择最佳格式：GLB > FBX（只使用兼容性好的格式）
  const getBestModelUrl = () => {
    if (taskResult.model_urls?.glb) {
      return { url: taskResult.model_urls?.glb || '', format: 'GLB' as const };
    } else if (taskResult.model_urls?.fbx) {
      return { url: taskResult.model_urls?.fbx || '', format: 'FBX' as const };
    }
    return null;
  };

  const bestModel = getBestModelUrl();

  // 自动下载最佳格式的模型
  useEffect(() => {
    if (bestModel && !localModelUrl && loadStatus === 'idle') {
      handleDownloadAndLoad(bestModel.url, bestModel.format);
    }
  }, [bestModel, localModelUrl, loadStatus]);

  const handleDownloadAndLoad = async (url: string, format: 'GLB' | 'FBX') => {
    setLoadStatus('downloading');
    setErrorMessage('');
    setCurrentFormat(format);

    console.log('Starting download and load:', { url, format, taskId: taskResult.id });

    try {
      const blobUrl = await downloadModel(url, format);
      if (blobUrl) {
        console.log('Download successful, blob URL created:', blobUrl);
        setLocalModelUrl(blobUrl);
        setLoadStatus('loading');
      } else {
        console.error('Download failed: no blob URL returned');
        setLoadStatus('error');
        setErrorMessage('下载失败');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      setLoadStatus('error');
      setErrorMessage(error.message || '下载失败');
    }
  };

  const handleModelLoad = () => {
    setLoadStatus('success');
  };

  const handleModelError = (error: any) => {
    setLoadStatus('error');
    const errorMsg = error?.message || '模型加载失败';
    setErrorMessage(errorMsg);
    console.error('Model loading error details:', {
      error,
      localModelUrl,
      currentFormat,
      taskResult: taskResult.id
    });
  };

  const getModelComponent = () => {
    if (!localModelUrl || !currentFormat) return <FallbackModel />;

    switch (currentFormat) {
      case 'GLB':
        return <GLBModel url={localModelUrl} onLoad={handleModelLoad} onError={handleModelError} />;
      case 'FBX':
        return <FBXModel url={localModelUrl} onLoad={handleModelLoad} onError={handleModelError} />;
      default:
        return <FallbackModel />;
    }
  };

  const downloadState = bestModel ? getDownloadState(bestModel.url, bestModel.format) : null;

  if (!bestModel) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Box className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">暂无3D模型</p>
            <p className="text-xs text-muted-foreground">仅支持GLB和FBX格式</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const ViewerContent = () => (
    <div className="relative h-full min-h-[400px]">
      {/* 下载状态显示 */}
      {loadStatus === 'downloading' && downloadState && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 min-w-[200px]">
            <div className="flex items-center space-x-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">下载 {currentFormat} 模型中...</span>
            </div>
            <Progress value={downloadState.progress} className="w-full" />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(downloadState.progress)}%
            </div>
          </div>
        </div>
      )}

      {/* 错误状态显示 */}
      {loadStatus === 'error' && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">加载失败</span>
            </div>
            <p className="text-red-700 text-xs mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        className="rounded-lg"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          console.log('Canvas created successfully');
          const canvas = gl.domElement as HTMLCanvasElement;
          const onLost = (e: Event) => {
            e.preventDefault();
            console.warn('WebGL context lost');
            toast.warning('3D 预览已暂停（显卡资源不足）');
          };
          const onRestored = () => {
            console.info('WebGL context restored');
            toast.success('3D 预览已恢复');
          };
          canvas.addEventListener('webglcontextlost', onLost as EventListener, false);
          canvas.addEventListener('webglcontextrestored', onRestored as EventListener, false);
        }}
        onError={(error) => {
          console.error('Canvas error:', error);
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        <Suspense fallback={<FallbackModel />}>
          {getModelComponent()}
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.05}
          screenSpacePanning={false}
        />
      </Canvas>

      {/* 加载指示器 */}
      {loadStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">加载 {currentFormat} 模型中...</span>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="flex flex-col bg-background/80 backdrop-blur-sm rounded-lg p-2 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRotate(!autoRotate)}
            className="h-8 w-8 p-0"
            title={autoRotate ? "停止自动旋转" : "开始自动旋转"}
          >
            <RotateCcw className={`h-4 w-4 ${autoRotate ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            className="h-8 w-8 p-0"
            title={isFullscreen ? "退出全屏" : "全屏查看"}
          >
            <Maximize className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => bestModel && window.open(bestModel.url, '_blank')}
            className="h-8 w-8 p-0"
            title="下载模型"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 模型信息覆盖层 */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">
                <Eye className="h-3 w-3 mr-1" />
                3D 预览 ({currentFormat || 'GLB'})
              </Badge>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>任务ID: {taskResult.id}</div>
                <div>状态: {loadStatus === 'success' ? '加载完成' : loadStatus === 'loading' ? '加载中' : loadStatus
                  === 'downloading' ? '下载中' : '准备中'}</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bestModel && window.open(bestModel.url, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full">
          <ViewerContent />
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Box className="h-5 w-5" />
          <span>3D 模型预览</span>
          {currentFormat && (
            <Badge variant="outline">{currentFormat}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ViewerContent />

        {/* 模型详细信息 */}
        <Separator />
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="font-medium">模型信息</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">模型ID</div>
              <div className="font-medium text-xs">{taskResult.id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">艺术风格</div>
              <div className="font-medium">{taskResult.art_style}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">生成模式</div>
              <div className="font-medium">{taskResult.mode}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">使用格式</div>
              <div className="font-medium">{currentFormat || 'GLB'}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {taskResult.model_urls?.glb && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.model_urls?.glb, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载 GLB
              </Button>
            )}
            {taskResult.model_urls?.fbx && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.model_urls?.fbx, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载 FBX
              </Button>
            )}
            {taskResult.model_urls?.obj && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.model_urls?.obj, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载 OBJ
              </Button>
            )}
            {taskResult.model_urls?.usdz && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.model_urls?.usdz, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载 USDZ
              </Button>
            )}
            {taskResult.thumbnail_url && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.thumbnail_url, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载缩略图
              </Button>
            )}
            {taskResult.video_url && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.video_url, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载视频
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 预加载模型 Hook
useGLTF.preload = (url: string) => {
  // 预加载3D模型以提高性能
};
