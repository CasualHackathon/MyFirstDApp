'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useFBX, Environment } from '@react-three/drei';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Download,
  Eye
} from 'lucide-react';
import { TaskStatusResponse } from '@/shared/meshy/types';
import { useModelDownload } from '@/hooks/use-model-download';

interface TestModel3DViewerProps {
  url: string;
  format: 'GLB' | 'FBX' | 'OBJ';
  taskResult: TaskStatusResponse;
}

// GLB模型组件
function GLBModel({ url, onLoad, onError }: { url: string; onLoad: () => void; onError: (error: any) => void }) {
  const modelRef = useRef<any>(null);

  try {
    const { scene } = useGLTF(url);

    useEffect(() => {
      if (scene) {
        onLoad();
      }
    }, [scene, onLoad]);

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

// OBJ模型组件 (需要额外的loader)
function OBJModel({ url, onLoad, onError }: { url: string; onLoad: () => void; onError: (error: any) => void }) {
  const modelRef = useRef<any>(null);

  // OBJ格式在Three.js中需要特殊处理，这里先显示错误
  useEffect(() => {
    onError(new Error('OBJ format requires additional loader setup'));
  }, [onError]);

  return (
    <mesh ref={modelRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ff6b6b" wireframe />
    </mesh>
  );
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

export function TestModel3DViewer({ url, format, taskResult }: TestModel3DViewerProps) {
  const [loadStatus, setLoadStatus] = useState<'idle' | 'downloading' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [localModelUrl, setLocalModelUrl] = useState<string | null>(null);

  const { downloadModel, getDownloadState } = useModelDownload();
  const downloadState = getDownloadState(url, format);

  // 自动下载模型
  useEffect(() => {
    if (url && !localModelUrl && !downloadState.blobUrl && !downloadState.isLoading) {
      handleDownloadAndLoad();
    }
  }, [url, downloadState.blobUrl]);

  const handleDownloadAndLoad = async () => {
    setLoadStatus('downloading');
    setErrorMessage('');

    try {
      const blobUrl = await downloadModel(url, format);
      if (blobUrl) {
        setLocalModelUrl(blobUrl);
        setLoadStatus('loading');
      } else {
        setLoadStatus('error');
        setErrorMessage('下载失败');
      }
    } catch (error: any) {
      setLoadStatus('error');
      setErrorMessage(error.message || '下载失败');
    }
  };

  const handleModelLoad = () => {
    setLoadStatus('success');
  };

  const handleModelError = (error: any) => {
    setLoadStatus('error');
    setErrorMessage(error?.message || `Failed to load ${format} model`);
  };

  const getModelComponent = () => {
    if (!localModelUrl) return <FallbackModel />;

    switch (format) {
      case 'GLB':
        return <GLBModel url={localModelUrl} onLoad={handleModelLoad} onError={handleModelError} />;
      case 'FBX':
        return <FBXModel url={localModelUrl} onLoad={handleModelLoad} onError={handleModelError} />;
      case 'OBJ':
        return <OBJModel url={localModelUrl} onLoad={handleModelLoad} onError={handleModelError} />;
      default:
        return <FallbackModel />;
    }
  };

  const getStatusBadge = () => {
    switch (loadStatus) {
      case 'idle':
        return (
          <Badge variant="outline" className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>准备中</span>
          </Badge>
        );
      case 'downloading':
        return (
          <Badge variant="outline" className="flex items-center space-x-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>下载中</span>
          </Badge>
        );
      case 'loading':
        return (
          <Badge variant="outline" className="flex items-center space-x-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>加载中</span>
          </Badge>
        );
      case 'success':
        return (
          <Badge variant="default" className="flex items-center space-x-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>加载成功</span>
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>加载失败</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 状态指示器 */}
      <div className="flex items-center justify-between">
        {getStatusBadge()}
        {(loadStatus === 'downloading' || loadStatus === 'loading') && downloadState.progress > 0 && (
          <span className="text-sm text-muted-foreground">
            {Math.round(downloadState.progress)}%
          </span>
        )}
      </div>

      {/* 下载进度条 */}
      {loadStatus === 'downloading' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>下载进度</span>
            <span>{Math.round(downloadState.progress)}%</span>
          </div>
          <Progress value={downloadState.progress} className="w-full" />
        </div>
      )}

      {/* 错误信息 */}
      {loadStatus === 'error' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">加载失败</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          <details className="mt-2">
            <summary className="text-sm cursor-pointer">显示URL详情</summary>
            <code className="text-xs bg-red-100 p-2 rounded mt-1 block break-all">
              {url}
            </code>
          </details>
        </div>
      )}

      {/* 3D预览器 */}
      <div className="relative h-64 bg-gray-50 rounded-lg border">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          className="rounded-lg"
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
          />
        </Canvas>

        {/* 加载指示器覆盖层 */}
        {(loadStatus === 'downloading' || loadStatus === 'loading') && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">
                {loadStatus === 'downloading' ? `下载 ${format} 模型中...` : `加载 ${format} 模型中...`}
              </span>
              {loadStatus === 'downloading' && downloadState.progress > 0 && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(downloadState.progress)}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url, '_blank')}
          disabled={loadStatus === 'downloading' || loadStatus === 'loading'}
        >
          <Download className="h-4 w-4 mr-2" />
          下载原文件
        </Button>

        {localModelUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const a = document.createElement('a');
              a.href = localModelUrl;
              a.download = `model.${format.toLowerCase()}`;
              a.click();
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            保存本地文件
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log(`🔄 重新测试 ${format} 格式`);
            console.log(`原始URL: ${url}`);
            if (localModelUrl) {
              console.log(`本地URL: ${localModelUrl}`);
            }
            handleDownloadAndLoad();
          }}
          disabled={loadStatus === 'downloading' || loadStatus === 'loading'}
        >
          重新测试
        </Button>
      </div>

      {/* 技术信息 */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>格式: {format}</div>
        <div>下载状态: {downloadState.isLoading ? '下载中' : downloadState.blobUrl ? '已下载' : '未下载'}</div>
        <div>React Three Fiber 兼容性: {format === 'GLB' ? '✅ 完全支持' : format === 'FBX' ? '⚠️ 需要额外配置' : '❌ 需要自定义loader'}</div>
        <div>推荐使用: {format === 'GLB' ? '是' : '否'}</div>
        {localModelUrl && (
          <div className="pt-1">
            <details>
              <summary className="cursor-pointer">显示本地URL</summary>
              <code className="text-xs bg-muted p-1 rounded mt-1 block break-all">
                {localModelUrl}
              </code>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}