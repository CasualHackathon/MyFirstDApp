import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface DownloadState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  blobUrl: string | null;
}

interface DownloadOptions {
  useProxy?: boolean;  // 是否使用代理
  chunkSize?: number;  // 分块下载大小
  enableCache?: boolean; // 是否启用缓存
}

export function useModelDownloadV2() {
  const [downloadStates, setDownloadStates] = useState<
    Record<string, DownloadState>
  >({});

  // 方法1: 直接下载（最快，但可能有CORS问题）
  const directDownload = async (url: string, format: string): Promise<string | null> => {
    console.log('🚀 Using direct download method (fastest)');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors', // 尝试绕过CORS
        cache: 'force-cache', // 使用浏览器缓存
      });

      if (response.type === 'opaque') {
        // no-cors 请求返回 opaque response，无法读取内容
        // 回退到其他方法
        throw new Error('CORS blocked, fallback needed');
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn('Direct download failed:', error);
      return null;
    }
  };

  // 方法2: 使用 Web Worker 下载（避免阻塞主线程）
  const workerDownload = async (url: string, format: string): Promise<string | null> => {
    console.log('📦 Using Web Worker download (non-blocking)');
    
    return new Promise((resolve, reject) => {
      // 创建内联 Worker
      const workerCode = `
        self.onmessage = async function(e) {
          const { url, apiKey } = e.data;
          try {
            const headers = apiKey ? { 'Authorization': 'Bearer ' + apiKey } : {};
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
              throw new Error('Download failed: ' + response.status);
            }
            
            const blob = await response.blob();
            self.postMessage({ success: true, blob });
          } catch (error) {
            self.postMessage({ success: false, error: error.message });
          }
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      
      worker.onmessage = (e) => {
        if (e.data.success) {
          const blobUrl = URL.createObjectURL(e.data.blob);
          resolve(blobUrl);
        } else {
          reject(new Error(e.data.error));
        }
        worker.terminate();
      };
      
      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };
      
      // 发送下载请求到 Worker
      worker.postMessage({ 
        url, 
        apiKey: process.env.NEXT_PUBLIC_MESHY_API_KEY 
      });
    });
  };

  // 方法3: 分块下载（适合大文件）
  const chunkedDownload = async (url: string, format: string, chunkSize = 1024 * 1024): Promise<string | null> => {
    console.log('🔄 Using chunked download (for large files)');
    
    try {
      // 先获取文件大小
      const headResponse = await fetch(url, { method: 'HEAD' });
      const contentLength = parseInt(headResponse.headers.get('content-length') || '0');
      
      if (contentLength === 0) {
        throw new Error('Cannot determine file size');
      }
      
      const chunks: Uint8Array[] = [];
      let downloaded = 0;
      
      // 分块下载
      while (downloaded < contentLength) {
        const start = downloaded;
        const end = Math.min(downloaded + chunkSize - 1, contentLength - 1);
        
        const response = await fetch(url, {
          headers: {
            'Range': `bytes=${start}-${end}`,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MESHY_API_KEY}`,
          },
        });
        
        const chunk = new Uint8Array(await response.arrayBuffer());
        chunks.push(chunk);
        
        downloaded += chunk.length;
        
        // 更新进度
        const progress = (downloaded / contentLength) * 100;
        console.log(`Download progress: ${progress.toFixed(1)}%`);
      }
      
      // 合并所有块
      const fullArray = new Uint8Array(downloaded);
      let position = 0;
      for (const chunk of chunks) {
        fullArray.set(chunk, position);
        position += chunk.length;
      }
      
      const blob = new Blob([fullArray]);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Chunked download failed:', error);
      return null;
    }
  };

  // 方法4: 使用 Service Worker 缓存（最优方案）
  const serviceWorkerDownload = async (url: string, format: string): Promise<string | null> => {
    console.log('⚡ Using Service Worker cache (optimal)');
    
    try {
      // 注册 Service Worker（如果还没有）
      if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
        await navigator.serviceWorker.register('/sw.js');
      }
      
      // 使用缓存优先策略
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MESHY_API_KEY}`,
        },
      });
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Service Worker download failed:', error);
      return null;
    }
  };

  // 主下载函数，智能选择最佳方法
  const downloadModel = useCallback(
    async (url: string, format: string, options?: DownloadOptions): Promise<string | null> => {
      const key = `${format}-${url}`;
      
      // 检查缓存
      if (downloadStates[key]?.blobUrl) {
        console.log('✅ Using cached model');
        return downloadStates[key].blobUrl;
      }

      // 初始化状态
      setDownloadStates((prev) => ({
        ...prev,
        [key]: {
          isLoading: true,
          progress: 0,
          error: null,
          blobUrl: null,
        },
      }));

      try {
        let blobUrl: string | null = null;
        
        // 智能选择下载方法
        if (options?.useProxy === false) {
          // 尝试直接下载（最快）
          blobUrl = await directDownload(url, format);
          
          // 如果失败，尝试 Worker 下载
          if (!blobUrl) {
            blobUrl = await workerDownload(url, format);
          }
        } else {
          // 默认使用 Service Worker（最优）
          if ('serviceWorker' in navigator) {
            blobUrl = await serviceWorkerDownload(url, format);
          }
          
          // 回退到 Worker 下载
          if (!blobUrl) {
            blobUrl = await workerDownload(url, format);
          }
          
          // 最后尝试分块下载
          if (!blobUrl) {
            blobUrl = await chunkedDownload(url, format);
          }
        }

        if (!blobUrl) {
          throw new Error('All download methods failed');
        }

        // 更新状态
        setDownloadStates((prev) => ({
          ...prev,
          [key]: {
            isLoading: false,
            progress: 100,
            error: null,
            blobUrl,
          },
        }));

        toast.success(`${format} 模型下载完成`);
        return blobUrl;
      } catch (error: any) {
        const errorMessage = error.message || '下载失败';
        
        setDownloadStates((prev) => ({
          ...prev,
          [key]: {
            isLoading: false,
            progress: 0,
            error: errorMessage,
            blobUrl: null,
          },
        }));

        toast.error(`下载失败: ${errorMessage}`);
        return null;
      }
    },
    [downloadStates]
  );

  const getDownloadState = useCallback(
    (url: string, format: string): DownloadState => {
      const key = `${format}-${url}`;
      return (
        downloadStates[key] || {
          isLoading: false,
          progress: 0,
          error: null,
          blobUrl: null,
        }
      );
    },
    [downloadStates]
  );

  const clearDownloads = useCallback(() => {
    Object.values(downloadStates).forEach((state) => {
      if (state.blobUrl) {
        URL.revokeObjectURL(state.blobUrl);
      }
    });
    setDownloadStates({});
  }, [downloadStates]);

  // 预下载函数（在后台预先下载）
  const preloadModel = useCallback(
    async (url: string, format: string) => {
      const key = `${format}-${url}`;
      
      // 如果已经在下载或已下载，跳过
      if (downloadStates[key]?.isLoading || downloadStates[key]?.blobUrl) {
        return;
      }
      
      // 在后台静默下载
      downloadModel(url, format, { useProxy: false });
    },
    [downloadStates, downloadModel]
  );

  return {
    downloadModel,
    getDownloadState,
    clearDownloads,
    preloadModel,
  };
}