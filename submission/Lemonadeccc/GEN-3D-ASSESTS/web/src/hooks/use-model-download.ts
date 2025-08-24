import { useState, useCallback } from 'react';
import { meshyClient } from '@/shared/meshy/config';
import { toast } from 'sonner';

interface DownloadState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  blobUrl: string | null;
}

export function useModelDownload() {
  const [downloadStates, setDownloadStates] = useState<
    Record<string, DownloadState>
  >({});

  const downloadModel = useCallback(
    async (url: string, format: string): Promise<string | null> => {
      const key = `${format}-${url}`;

      // 如果已经下载过，直接返回blob URL
      if (downloadStates[key]?.blobUrl) {
        return downloadStates[key].blobUrl;
      }

      // 初始化下载状态
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
        const blobUrl = await meshyClient.downloadModelAsBlob(
          url,
          (progress) => {
            setDownloadStates((prev) => ({
              ...prev,
              [key]: {
                ...prev[key],
                progress,
              },
            }));
          }
        );

        // 下载成功
        setDownloadStates((prev) => ({
          ...prev,
          [key]: {
            isLoading: false,
            progress: 100,
            error: null,
            blobUrl,
          },
        }));

        toast.success(`${format.toUpperCase()} 模型下载完成`);
        return blobUrl;
      } catch (error: any) {
        // 下载失败
        setDownloadStates((prev) => ({
          ...prev,
          [key]: {
            isLoading: false,
            progress: 0,
            error: error.message || '下载失败',
            blobUrl: null,
          },
        }));

        toast.error(`${format.toUpperCase()} 模型下载失败: ${error.message}`);
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
    // 清理所有blob URLs
    Object.values(downloadStates).forEach((state) => {
      if (state.blobUrl) {
        URL.revokeObjectURL(state.blobUrl);
      }
    });
    setDownloadStates({});
  }, [downloadStates]);

  return {
    downloadModel,
    getDownloadState,
    clearDownloads,
  };
}
