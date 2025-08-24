// Meshy API 类型定义

// 配置接口
export interface MeshyConfig {
  apiKey: string;
  baseURL?: string;
  maxRetries?: number;
  retryDelay?: number;
}

// 错误类
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 基础响应接口
export interface MeshyResponse {
  success: boolean;
  message?: string;
}

// 余额响应
export interface BalanceResponse {
  balance: number;
}

// 任务响应
export interface TaskResponse {
  result: string; // Meshy API返回的是 result 字段包含 task_id
  estimated_time?: number;
  credits_used?: number;
}

// 任务状态枚举
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';

// 任务状态响应 (匹配真实API响应格式)
export interface TaskStatusResponse {
  id: string; // 真实API使用 id 而不是 task_id
  mode: string;
  name: string;
  seed: number;
  art_style: string;
  texture_richness: string;
  prompt: string;
  negative_prompt: string;
  texture_prompt: string;
  texture_image_url: string;
  status: TaskStatus;
  created_at: number; // 时间戳格式
  progress: number;
  started_at?: number;
  finished_at?: number;
  task_error: string | null;
  model_urls?: {
    glb?: string;
    fbx?: string;
    obj?: string;
    usdz?: string;
    mtl?: string;
    stl?: string;
    blend?: string;
  };
  thumbnail_url?: string;
  video_url?: string;
  texture_urls?: Array<{
    base_color?: string;
    roughness?: string;
    normal?: string;
    metallic?: string;
  }>;
  polycount?: number; // 多边形数量
  target_polycount?: number; // 目标多边形数量
}

// 任务结果
export interface TaskResult {
  model_urls: {
    glb?: string;
    fbx?: string;
    obj?: string;
    usdz?: string;
    stl?: string;
    blend?: string;
  };
  preview_url?: string;
  thumbnail_url?: string;
  model_info?: {
    vertices: number;
    faces: number;
    file_size: number;
    dimensions: {
      x: number;
      y: number;
      z: number;
    };
  };
  pbr_maps?: {
    base_color?: string;
    metallic?: string;
    roughness?: string;
    normal?: string;
  };
}

// Text to 3D 参数
export interface TextTo3DParams {
  mode: 'preview' | 'refine';
  prompt: string;
  art_style?: 'realistic' | 'sculpture';
  negative_prompt?: string;
  seed?: number;
  ai_model?: 'meshy-4' | 'meshy-5';
  topology?: 'quad' | 'triangle';
  target_polycount?: number;
  should_remesh?: boolean;
  symmetry_mode?: 'off' | 'auto' | 'on';
  preview_task_id?: string; // 对于refine模式，需要提供preview任务的ID
}

// Image to 3D 参数
export interface ImageTo3DParams {
  image_url: string;
  should_texture?: boolean;
  ai_model?: 'meshy-4' | 'meshy-5';
  topology?: 'quad' | 'triangle';
  target_polycount?: number;
  symmetry_mode?: 'off' | 'auto' | 'on';
  enable_pbr?: boolean;
}

// Text to Texture 参数
export interface TextToTextureParams {
  model_url: string; // GLB模型的URL
  prompt: string; // 纹理描述，最大600字符
  text_style_prompt?: string; // 文本风格提示
  negative_prompt?: string; // 负面提示
  ai_model?: 'meshy-4' | 'meshy-5';
  enable_pbr?: boolean; // 是否生成PBR贴图
  enable_original_uv?: boolean; // 是否使用原始UV
}

// Image to Texture 参数
export interface ImageToTextureParams {
  model_url: string; // GLB模型的URL
  image_style_url: string; // 风格图片URL（原名image_url，改为符合API要求）
  negative_prompt?: string; // 负面提示
  ai_model?: 'meshy-4' | 'meshy-5';
  enable_pbr?: boolean; // 是否生成PBR贴图
  enable_original_uv?: boolean; // 是否使用原始UV
}

// 任务筛选参数
export interface TaskFilters {
  status?: TaskStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}