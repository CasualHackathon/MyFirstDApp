import { MeshyClient } from './client';

// 创建全局 Meshy 客户端实例
export const meshyClient = new MeshyClient({
  apiKey: process.env.NEXT_PUBLIC_MESHY_API_KEY || 'demo_key',
  maxRetries: 3,
  retryDelay: 1000,
});

// 费用常量
export const MESHY_PRICING = {
  'text-to-3d-preview': 5,
  'text-to-3d-refine': 10,
  'image-to-3d': 5,
  'image-to-3d-textured': 15,
  'retexture': 10,
  'remesh': 5,
  'auto-rigging': 5,
  'animation': 3,
} as const;

// 模型质量配置
export const MODEL_QUALITY_OPTIONS = [
  { value: 'meshy-4', label: 'Meshy 4 (标准)', description: '更快生成，标准质量' },
  { value: 'meshy-5', label: 'Meshy 5 (高质量)', description: '更慢生成，更高质量' },
] as const;

// 艺术风格配置
export const ART_STYLE_OPTIONS = [
  { value: 'realistic', label: '写实风格', description: '逼真的外观和纹理' },
  { value: 'sculpture', label: '雕塑风格', description: '高多边形，集成PBR纹理' },
] as const;

// 拓扑类型配置
export const TOPOLOGY_OPTIONS = [
  { value: 'triangle', label: '三角网格', description: '适合游戏和实时渲染' },
  { value: 'quad', label: '四边网格', description: '适合建模和动画' },
] as const;

// 对称性配置
export const SYMMETRY_OPTIONS = [
  { value: 'auto', label: '自动', description: '智能检测对称性' },
  { value: 'on', label: '开启', description: '强制对称生成' },
  { value: 'off', label: '关闭', description: '禁用对称性' },
] as const;

// 多边形数量预设
export const POLYCOUNT_PRESETS = [
  { value: 1000, label: '低精度 (1K)', description: '适合游戏和移动设备' },
  { value: 5000, label: '中精度 (5K)', description: '平衡质量和性能' },
  { value: 20000, label: '高精度 (20K)', description: '适合展示和渲染' },
  { value: 50000, label: '超高精度 (50K)', description: '适合专业制作' },
] as const;

// 默认生成参数
export const DEFAULT_TEXT_TO_3D_PARAMS = {
  mode: 'preview' as const,
  art_style: 'realistic' as const,
  ai_model: 'meshy-5' as const,
  topology: 'triangle' as const,
  target_polycount: 5000,
  symmetry_mode: 'auto' as const,
  should_remesh: false,
};

// 工具函数
export function calculateCost(mode: 'preview' | 'refine' | 'both'): number {
  switch (mode) {
    case 'preview':
      return MESHY_PRICING['text-to-3d-preview'];
    case 'refine':
      return MESHY_PRICING['text-to-3d-refine'];
    case 'both':
      return MESHY_PRICING['text-to-3d-preview'] + MESHY_PRICING['text-to-3d-refine'];
    default:
      return 0;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function estimateGenerationTime(
  mode: 'preview' | 'refine', 
  polycount: number = 5000
): number {
  // 基础时间（秒）
  const baseTime = mode === 'preview' ? 60 : 120;
  
  // 多边形数量影响因子
  const polycountFactor = Math.max(0.5, Math.min(2, polycount / 10000));
  
  return Math.round(baseTime * polycountFactor);
}