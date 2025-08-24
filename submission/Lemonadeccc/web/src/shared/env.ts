import { z } from 'zod';

// 环境变量模式定义
const envSchema = z.object({
  // Meshy API密钥 - 开发环境允许为空或使用占位符
  MESHY_API_KEY: z.string().min(1).optional(),
  
  // 必需的公共环境变量
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1).default('development_project_id_placeholder'),
  
  // 可选的环境变量
  NEXT_PUBLIC_PINATA_JWT: z.string().optional(),
  NEXT_PUBLIC_PINATA_GATEWAY: z.string().url().optional().default('https://gateway.pinata.cloud'),
  
  // RPC URLs
  NEXT_PUBLIC_RPC_URL_SEPOLIA: z.string().url().optional().default('https://rpc.sepolia.org'),
  
  // 开发模式配置
  NEXT_PUBLIC_USE_REAL_API: z.enum(['true', 'false']).optional().default('false'),
  NEXT_PUBLIC_DEBUG_ENABLED: z.enum(['true', 'false']).optional().default('false'),
  
  // Node环境
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// 验证环境变量
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:', error.issues);
      
      // 在开发环境中允许继续运行，使用默认值
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using default values for development environment');
        return getDefaultEnv();
      } else {
        throw new Error(`Environment validation failed: ${error.issues.map(e => e.message).join(', ')}`);
      }
    } else {
      console.error('Unexpected error during environment validation:', error);
      throw error;
    }
  }
}

// 默认环境配置
function getDefaultEnv() {
  return {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: 'development_project_id_placeholder',
    NEXT_PUBLIC_PINATA_GATEWAY: 'https://gateway.pinata.cloud',
    NEXT_PUBLIC_RPC_URL_SEPOLIA: 'https://rpc.sepolia.org',
    NEXT_PUBLIC_USE_REAL_API: 'false' as const,
    NEXT_PUBLIC_DEBUG_ENABLED: 'false' as const,
    NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  };
}

// 导出验证后的环境变量
export const env = validateEnv();

// 类型导出
export type Env = z.infer<typeof envSchema>;

// 辅助函数
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isDebugEnabled = env.NEXT_PUBLIC_DEBUG_ENABLED === 'true';