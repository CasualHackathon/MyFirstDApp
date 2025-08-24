// 简单的日志工具
const formatLogData = (data: any): string => {
  if (data === null || data === undefined) return '';
  
  // 检查是否是空对象
  if (typeof data === 'object' && Object.keys(data).length === 0) {
    return '[空对象]';
  }
  
  // 如果是Error对象，提取有用信息
  if (data instanceof Error) {
    return `Error: ${data.message || data.name || '未知错误'}`;
  }
  
  // 如果是字符串
  if (typeof data === 'string') {
    return data;
  }
  
  // 尝试JSON序列化，失败则返回toString
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    return jsonStr !== '{}' ? jsonStr : `[${typeof data}对象]`;
  } catch {
    return data.toString?.() || `[${typeof data}]`;
  }
};

export const logger = {
  info: (message: string, data?: any) => {
    const formattedData = data ? formatLogData(data) : '';
    console.info(`[INFO] ${message}`, formattedData);
  },
  
  warn: (message: string, data?: any) => {
    const formattedData = data ? formatLogData(data) : '';
    console.warn(`[WARN] ${message}`, formattedData);
  },
  
  error: (message: string, data?: any) => {
    const formattedData = data ? formatLogData(data) : '';
    console.error(`[ERROR] ${message}`, formattedData);
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const formattedData = data ? formatLogData(data) : '';
      console.debug(`[DEBUG] ${message}`, formattedData);
    }
  }
};