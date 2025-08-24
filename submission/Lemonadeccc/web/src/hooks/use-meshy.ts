import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from '@tanstack/react-query';
import { meshyClient } from '@/shared/meshy/config';
import {
  TextTo3DParams,
  TextToTextureParams,
  TaskStatusResponse,
  TaskStatus,
} from '@/shared/meshy/types';
import { toast } from 'sonner';
import React from 'react';

// 查询键工厂
export const meshyQueries = {
  all: ['meshy'] as const,
  balance: () => [...meshyQueries.all, 'balance'] as const,
  tasks: () => [...meshyQueries.all, 'tasks'] as const,
  task: (id: string) => [...meshyQueries.tasks(), id] as const,
  textureTask: (id: string) =>
    [...meshyQueries.tasks(), 'texture', id] as const,
  userTasks: (userId: string) =>
    [...meshyQueries.tasks(), 'user', userId] as const,
};

// 余额查询 Hook
export function useBalance() {
  return useQuery({
    queryKey: meshyQueries.balance(),
    queryFn: () => {
      // 检查是否强制使用真实API
      const useRealAPI = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';

      // 开发环境：只有明确设置使用真实API时才使用真实API
      if (process.env.NODE_ENV === 'development' && !useRealAPI) {
        return meshyClient.mockBalance();
      }
      return meshyClient.getBalance();
    },
    staleTime: 1000 * 60 * 2, // 2分钟
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false; // 认证错误不重试
      return failureCount < 2;
    },
  });
}

// 任务状态查询 Hook
export function useTaskStatus(taskId: string | null) {
  return useQuery({
    queryKey: meshyQueries.task(taskId || ''),
    queryFn: () => {
      if (!taskId) throw new Error('Task ID is required');

      // 检查是否强制使用真实API
      const useRealAPI = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
      const hasValidAPIKey =
        process.env.NEXT_PUBLIC_MESHY_API_KEY &&
        process.env.NEXT_PUBLIC_MESHY_API_KEY !== 'demo_key';

      // 开发环境：只有明确设置使用真实API且有有效密钥时才使用真实API
      if (
        process.env.NODE_ENV === 'development' &&
        (!useRealAPI || !hasValidAPIKey)
      ) {
        return meshyClient.mockTaskStatus(taskId);
      }
      return meshyClient.getTaskStatus(taskId);
    },
    enabled: !!taskId,
    refetchInterval: (data: any) => {
      // 根据任务状态决定轮询间隔
      if (!data) return 3000;

      const taskData = data as unknown as TaskStatusResponse;
      switch (taskData.status) {
        case 'SUCCEEDED':
        case 'FAILED':
          return false; // 停止轮询
        case 'PENDING':
          return 5000; // 5秒轮询
        case 'IN_PROGRESS':
          return 2000; // 2秒轮询
        default:
          return 3000;
      }
    },
    refetchIntervalInBackground: true, // 后台轮询
  });
}

// Text to 3D 生成 Hook
export function useTextTo3D() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: TextTo3DParams) => {
      // 检查是否强制使用真实API
      const useRealAPI = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
      const hasValidAPIKey =
        process.env.NEXT_PUBLIC_MESHY_API_KEY &&
        process.env.NEXT_PUBLIC_MESHY_API_KEY !== 'demo_key';

      // 开发环境：只有明确设置使用真实API且有有效密钥时才使用真实API
      if (
        process.env.NODE_ENV === 'development' &&
        (!useRealAPI || !hasValidAPIKey)
      ) {
        return meshyClient.mockTextTo3D(params);
      }
      return meshyClient.textTo3D(params);
    },
    onMutate: async (params) => {
      // 乐观更新：立即显示生成中状态
      const tempTask: Partial<TaskStatusResponse> = {
        id: `temp-${Date.now()}`,
        status: 'PENDING',
        progress: 0,
        created_at: Date.now(),
      };

      // 可以在这里添加临时任务到用户任务列表
      return { tempTask, params };
    },
    onSuccess: (data, variables, context) => {
      console.log('Text to 3D success:', { data, variables }); // 调试日志

      // 检查返回的数据结构
      if (!data || !data.result) {
        console.error('Invalid API response:', data);
        toast.error('API响应异常', {
          description: '任务ID缺失，请检查API配置',
        });
        return;
      }

      const taskId = data.result; // 从 result 字段获取 task_id

      // 开始轮询新任务状态
      queryClient.prefetchQuery({
        queryKey: meshyQueries.task(taskId),
        queryFn: () => {
          // 检查是否强制使用真实API
          const useRealAPI = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
          const hasValidAPIKey =
            process.env.NEXT_PUBLIC_MESHY_API_KEY &&
            process.env.NEXT_PUBLIC_MESHY_API_KEY !== 'demo_key';

          if (
            process.env.NODE_ENV === 'development' &&
            (!useRealAPI || !hasValidAPIKey)
          ) {
            return meshyClient.mockTaskStatus(taskId);
          }
          return meshyClient.getTaskStatus(taskId);
        },
      });

      // 更新余额
      queryClient.invalidateQueries({ queryKey: meshyQueries.balance() });

      toast.success('生成任务已启动', {
        description: `Task ID: ${taskId.slice(0, 8)}...`,
      });
    },
    onError: (error: any, variables, context) => {
      console.error('Text to 3D generation failed:', error);

      toast.error('生成失败', {
        description: error.message || '无法启动3D模型生成',
      });
    },
  });
}

// 任务状态更新监听 Hook
export function useTaskStatusUpdates(
  taskId: string | null,
  onStatusChange?: (status: TaskStatusResponse) => void
) {
  const { data: taskStatus } = useTaskStatus(taskId);

  // 监听状态变化
  React.useEffect(() => {
    if (taskStatus && onStatusChange) {
      onStatusChange(taskStatus);
    }
  }, [taskStatus, onStatusChange]);

  return taskStatus;
}

// 多任务管理 Hook
export function useMultipleTasks(taskIds: string[]) {
  const queries = taskIds.map((taskId) => ({
    queryKey: meshyQueries.task(taskId),
    queryFn: () => {
      // 检查是否强制使用真实API
      const useRealAPI = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
      const hasValidAPIKey =
        process.env.NEXT_PUBLIC_MESHY_API_KEY &&
        process.env.NEXT_PUBLIC_MESHY_API_KEY !== 'demo_key';

      if (
        process.env.NODE_ENV === 'development' &&
        (!useRealAPI || !hasValidAPIKey)
      ) {
        return meshyClient.mockTaskStatus(taskId);
      }
      return meshyClient.getTaskStatus(taskId);
    },
    enabled: !!taskId,
    refetchInterval: (data: any) => {
      // 根据任务状态决定轮询间隔
      if (!data) return 3000;

      const taskData = data as unknown as TaskStatusResponse;
      switch (taskData.status) {
        case 'SUCCEEDED':
        case 'FAILED':
          return false;
        case 'PENDING':
          return 5000;
        case 'IN_PROGRESS':
          return 2000;
        default:
          return 3000;
      }
    },
  }));

  const results = useQueries({
    queries,
  });

  return {
    tasks: results
      .map((result) => result.data)
      .filter(Boolean) as TaskStatusResponse[],
    isLoading: results.some((result) => result.isLoading),
    errors: results.map((result) => result.error).filter(Boolean),
    completedCount: results.filter(
      (result) => result.data?.status === 'SUCCEEDED'
    ).length,
    failedCount: results.filter((result) => result.data?.status === 'FAILED')
      .length,
  };
}

// 导入必要的依赖移到文件顶部
// import React from 'react'; 已在顶部导入
// import { useQueries } from '@tanstack/react-query'; 已在顶部导入

// Text to Texture 生成 Hook
export function useTextToTexture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: TextToTextureParams) => {
      // 检查是否强制使用真实API
      const useRealAPI = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
      const hasValidAPIKey =
        process.env.NEXT_PUBLIC_MESHY_API_KEY &&
        process.env.NEXT_PUBLIC_MESHY_API_KEY !== 'demo_key';

      // 开发环境：只有明确设置使用真实API且有有效密钥时才使用真实API
      if (
        process.env.NODE_ENV === 'development' &&
        (!useRealAPI || !hasValidAPIKey)
      ) {
        // TODO: 添加 mock 方法
        throw new Error('Mock TextToTexture not implemented');
      }
      return meshyClient.textToTexture(params);
    },
    onMutate: async (params) => {
      const tempTask: Partial<TaskStatusResponse> = {
        id: `temp-texture-${Date.now()}`,
        status: 'PENDING',
        progress: 0,
        created_at: Date.now(),
      };

      return { tempTask, params };
    },
    onSuccess: (data, variables, context) => {
      console.log('Text to Texture success:', { data, variables });

      if (!data || !data.result) {
        console.error('Invalid Texture API response:', data);
        toast.error('纹理API响应异常', {
          description: '任务ID缺失，请检查API配置',
        });
        return;
      }

      const taskId = data.result;

      // 开始轮询新的纹理任务状态
      queryClient.prefetchQuery({
        queryKey: meshyQueries.textureTask(taskId),
        queryFn: () => {
          const useRealAPI = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
          const hasValidAPIKey =
            process.env.NEXT_PUBLIC_MESHY_API_KEY &&
            process.env.NEXT_PUBLIC_MESHY_API_KEY !== 'demo_key';

          if (
            process.env.NODE_ENV === 'development' &&
            (!useRealAPI || !hasValidAPIKey)
          ) {
            throw new Error('Mock TextureTaskStatus not implemented');
          }
          return meshyClient.getTextureTaskStatus(taskId);
        },
      });

      // 更新余额
      queryClient.invalidateQueries({ queryKey: meshyQueries.balance() });

      toast.success('纹理生成任务已启动', {
        description: `Task ID: ${taskId.slice(0, 8)}...`,
      });
    },
    onError: (error: any, variables, context) => {
      console.error('Text to Texture generation failed:', error);

      toast.error('纹理生成失败', {
        description: error.message || '无法启动纹理生成',
      });
    },
  });
}

// 纹理任务状态查询 Hook
export function useTextureTaskStatus(taskId: string | null) {
  return useQuery({
    queryKey: meshyQueries.textureTask(taskId || ''),
    queryFn: () => {
      if (!taskId) throw new Error('Texture Task ID is required');

      // 检查是否强制使用真实API
      const useRealAPI = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
      const hasValidAPIKey =
        process.env.NEXT_PUBLIC_MESHY_API_KEY &&
        process.env.NEXT_PUBLIC_MESHY_API_KEY !== 'demo_key';

      // 开发环境：只有明确设置使用真实API且有有效密钥时才使用真实API
      if (
        process.env.NODE_ENV === 'development' &&
        (!useRealAPI || !hasValidAPIKey)
      ) {
        throw new Error('Mock TextureTaskStatus not implemented');
      }
      return meshyClient.getTextureTaskStatus(taskId);
    },
    enabled: !!taskId,
    refetchInterval: (data: any) => {
      // 根据任务状态决定轮询间隔
      if (!data) return 3000;

      const taskData = data as unknown as TaskStatusResponse;
      switch (taskData.status) {
        case 'SUCCEEDED':
        case 'FAILED':
          return false; // 停止轮询
        case 'PENDING':
          return 5000; // 5秒轮询
        case 'IN_PROGRESS':
          return 2000; // 2秒轮询
        default:
          return 3000;
      }
    },
    refetchIntervalInBackground: true, // 后台轮询
    // 添加深度比较，只有当关键数据真正变化时才更新
    select: (data) => {
      if (!data) return data;

      // 只返回会影响UI的关键数据，忽略可能频繁变化但不重要的字段
      return {
        id: data.id,
        status: data.status,
        progress: data.progress,
        model_urls: data.model_urls,
        texture_urls: data.texture_urls,
        task_error: data.task_error,
        finished_at: data.finished_at,
      };
    },
    // 使用结构比较而不是引用比较
    structuralSharing: true,
    // 添加数据稳定性检查，避免相同数据触发重新渲染
    staleTime: 1000, // 1秒内的相同数据视为新鲜数据
    // 成功数据缓存时间
    gcTime: 5 * 60 * 1000, // 5分钟
    // 添加重试逻辑，但限制重试次数
    retry: (failureCount, error: any) => {
      // 如果是401认证错误，不重试
      if (error?.status === 401) return false;
      // 最多重试2次
      return failureCount < 2;
    },
    // 防止快速连续重新获取
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
