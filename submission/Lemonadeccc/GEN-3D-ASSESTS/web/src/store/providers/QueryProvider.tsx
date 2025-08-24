'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState, useEffect } from 'react';
import { logger } from '@/shared/logger';
import { isDevelopment } from '@/shared/env';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5分钟
          gcTime: 1000 * 60 * 30, // 30分钟垃圾回收（替代 cacheTime）
          retry: (failureCount, error) => {
            // 基础重试逻辑
            if (failureCount < 3) return true;
            return false;
          },
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          refetchOnWindowFocus: false, // 禁用窗口聚焦时重新获取
          refetchOnReconnect: true, // 网络重连时重新获取
          refetchOnMount: true, // 组件挂载时重新获取
        },
        mutations: {
          retry: (failureCount, error) => {
            // 对于某些错误类型不重试
            if (error instanceof Error) {
              // 4xx 错误通常不应该重试
              if ('status' in error && typeof error.status === 'number') {
                if (error.status >= 400 && error.status < 500) {
                  return false;
                }
              }
            }
            return failureCount < 2;
          },
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
      },
    });

    // 设置全局错误处理
    client.setDefaultOptions({
      queries: {
        ...client.getDefaultOptions().queries,
      },
      mutations: {
        ...client.getDefaultOptions().mutations,
      },
    });

    return client;
  });

  // 设置持久化（仅在客户端）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const persister = createSyncStoragePersister({
        storage: window.localStorage,
        key: 'REACT_QUERY_OFFLINE_CACHE',
        throttleTime: 1000,
      });

      // 持久化查询客户端
      persistQueryClient({
        queryClient,
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24小时
        hydrateOptions: {
          // 仅持久化特定查询
          defaultOptions: {
            queries: {
              gcTime: 1000 * 60 * 60 * 24, // 24小时
            },
          },
        },
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // 只持久化特定的查询
            const queryKey = query.queryKey[0];
            return (
              typeof queryKey === 'string' &&
              (queryKey.includes('balance') ||
                queryKey.includes('user') ||
                queryKey.includes('settings'))
            );
          },
        },
      });

      logger.info('Query client persistence initialized');
    }
  }, [queryClient]);

  // 设置查询客户端事件监听
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (isDevelopment) {
        logger.debug('Query cache event:', {
          type: event.type,
          query: event.query.queryKey,
        });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDevelopment && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}