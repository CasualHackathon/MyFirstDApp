import { 
  MeshyConfig, 
  APIError, 
  BalanceResponse, 
  TaskResponse, 
  TaskStatusResponse,
  TextTo3DParams,
  ImageTo3DParams,
  TextToTextureParams,
  ImageToTextureParams,
  TaskFilters 
} from './types';

export class MeshyClient {
  private apiKey: string;
  private baseURL = 'https://api.meshy.ai';
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(config: MeshyConfig) {
    this.apiKey = config.apiKey;
    if (config.baseURL) this.baseURL = config.baseURL;
    if (config.maxRetries !== undefined) this.maxRetries = config.maxRetries;
    if (config.retryDelay !== undefined) this.retryDelay = config.retryDelay;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let lastError: Error;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          throw await this.handleError(response);
        }

        const data = await response.json();
        console.log('API Response:', { endpoint, data }); // 调试日志
        return data as T;
      } catch (error) {
        lastError = error as Error;
        
        // 不重试的错误
        if (this.shouldNotRetry(error)) {
          throw error;
        }
        
        // 等待后重试
        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }
    
    throw lastError!;
  }

  private async handleError(response: Response): Promise<APIError> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch {
      // JSON解析失败，使用默认错误信息
    }
    
    const error = new APIError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData.code || 'UNKNOWN_ERROR',
      errorData
    );
    
    return error;
  }

  private shouldNotRetry(error: any): boolean {
    // 不重试的HTTP状态码
    const noRetryStatuses = [400, 401, 402, 403, 404, 422];
    return error.status && noRetryStatuses.includes(error.status);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 余额查询
  async getBalance(): Promise<BalanceResponse> {
    return this.request<BalanceResponse>('/openapi/v1/balance');
  }

  // Text to 3D
  async textTo3D(params: TextTo3DParams): Promise<TaskResponse> {
    // 验证参数
    this.validateTextTo3DParams(params);
    
    // 构建请求体，确保字段名符合API要求
    const requestBody: any = {
      mode: params.mode,
      prompt: params.prompt,
    };

    // 添加可选参数
    if (params.art_style) requestBody.art_style = params.art_style;
    if (params.negative_prompt) requestBody.negative_prompt = params.negative_prompt;
    if (params.seed !== undefined) requestBody.seed = params.seed;
    if (params.ai_model) requestBody.ai_model = params.ai_model;
    if (params.topology) requestBody.topology = params.topology;
    if (params.target_polycount !== undefined) requestBody.target_polycount = params.target_polycount;
    if (params.should_remesh !== undefined) requestBody.should_remesh = params.should_remesh;
    if (params.symmetry_mode) requestBody.symmetry_mode = params.symmetry_mode;
    
    // 对于refine模式，添加preview_task_id（尝试不同的字段名格式）
    if (params.mode === 'refine' && params.preview_task_id) {
      // 使用下划线格式，这是最常见的API字段名格式
      requestBody.preview_task_id = params.preview_task_id; 
      console.log('Adding preview task ID for refine mode:', params.preview_task_id);
    }
    
    console.log('Text to 3D request body:', JSON.stringify(requestBody, null, 2)); // 详细的调试日志
    
    return this.request<TaskResponse>('/openapi/v2/text-to-3d', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  // Image to 3D
  async imageTo3D(params: ImageTo3DParams): Promise<TaskResponse> {
    this.validateImageTo3DParams(params);
    
    return this.request<TaskResponse>('/openapi/v1/image-to-3d', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 任务状态查询
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    if (!taskId) {
      throw new APIError('Task ID is required', 400, 'MISSING_TASK_ID');
    }
    
    return this.request<TaskStatusResponse>(`/openapi/v2/text-to-3d/${taskId}`);
  }

  // Text to Texture - 重新纹理现有模型
  async textToTexture(params: TextToTextureParams): Promise<TaskResponse> {
    this.validateTextToTextureParams(params);
    
    const requestBody: any = {
      model_url: params.model_url,
      text_style_prompt: params.prompt, // 使用 text_style_prompt 而不是 prompt
    };

    // 添加可选参数 - 使用正确的API字段名
    if (params.text_style_prompt) requestBody.text_style_prompt = params.text_style_prompt; // 如果显式提供了，优先使用
    if (params.negative_prompt) requestBody.negative_prompt = params.negative_prompt;
    if (params.ai_model) requestBody.ai_model = params.ai_model;
    if (params.enable_pbr !== undefined) requestBody.enable_pbr = params.enable_pbr;
    if (params.enable_original_uv !== undefined) requestBody.enable_original_uv = params.enable_original_uv;
    
    console.log('Text to Texture request body:', JSON.stringify(requestBody, null, 2));
    
    return this.request<TaskResponse>('/openapi/v1/retexture', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  // Image to Texture - 基于图片重新纹理
  async imageToTexture(params: ImageToTextureParams): Promise<TaskResponse> {
    this.validateImageToTextureParams(params);
    
    const requestBody: any = {
      model_url: params.model_url,
      image_style_url: params.image_style_url, // 使用正确的字段名
    };

    // 添加可选参数
    if (params.negative_prompt) requestBody.negative_prompt = params.negative_prompt;
    if (params.ai_model) requestBody.ai_model = params.ai_model;
    if (params.enable_pbr !== undefined) requestBody.enable_pbr = params.enable_pbr;
    if (params.enable_original_uv !== undefined) requestBody.enable_original_uv = params.enable_original_uv;
    
    console.log('Image to Texture request body:', JSON.stringify(requestBody, null, 2));
    
    return this.request<TaskResponse>('/openapi/v1/retexture', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  // 获取 Texture 任务状态
  async getTextureTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    if (!taskId) {
      throw new APIError('Task ID is required', 400, 'MISSING_TASK_ID');
    }
    
    return this.request<TaskStatusResponse>(`/openapi/v1/retexture/${taskId}`);
  }

  // 下载模型并返回Blob URL (使用代理)
  async downloadModelAsBlob(
    downloadUrl: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    console.log('Downloading model via proxy from:', downloadUrl);
    
    try {
      // 使用代理API下载
      const proxyUrl = `/api/download-model?url=${encodeURIComponent(downloadUrl)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Proxy download failed:', response.status, errorData);
        throw new Error(`Proxy download failed: ${errorData.error || response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength || '0', 10);
      let loaded = 0;

      console.log('Starting proxy download, content length:', total);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');

      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (onProgress && total > 0) {
          const progress = (loaded / total) * 100;
          onProgress(progress);
          
          // 仅在重要节点记录日志
          if (progress % 25 === 0 || progress === 100) {
            console.log(`Download progress: ${progress.toFixed(1)}%`);
          }
        }
      }

      // 创建Blob并返回URL
      const blob = new Blob(chunks as BlobPart[]);
      const blobUrl = URL.createObjectURL(blob);
      
      console.log('Model downloaded successfully via proxy, size:', blob.size, 'bytes');
      console.log('Created blob URL:', blobUrl);
      return blobUrl;
    } catch (error) {
      console.error('Failed to download model via proxy:', error);
      throw error;
    }
  }

  // 参数验证
  private validateTextTo3DParams(params: TextTo3DParams): void {
    if (!params.prompt || params.prompt.length < 3) {
      throw new APIError('Prompt must be at least 3 characters long', 400, 'INVALID_PROMPT');
    }
    
    if (params.prompt.length > 600) {
      throw new APIError('Prompt must be less than 600 characters', 400, 'PROMPT_TOO_LONG');
    }
    
    if (!['preview', 'refine'].includes(params.mode)) {
      throw new APIError('Mode must be "preview" or "refine"', 400, 'INVALID_MODE');
    }

    // 只在实际是refine模式时检查preview_task_id
    if (params.mode === 'refine' && !params.preview_task_id) {
      console.error('Refine mode validation failed:', { mode: params.mode, preview_task_id: params.preview_task_id });
      throw new APIError('preview_task_id is required for refine mode', 400, 'MISSING_PREVIEW_TASK_ID');
    }

    console.log('Validation passed:', { mode: params.mode, hasPreviewTaskId: !!params.preview_task_id }); // 调试日志
  }

  private validateImageTo3DParams(params: ImageTo3DParams): void {
    if (!params.image_url) {
      throw new APIError('Image URL is required', 400, 'MISSING_IMAGE_URL');
    }
    
    // 验证URL格式
    try {
      new URL(params.image_url);
    } catch {
      throw new APIError('Invalid image URL format', 400, 'INVALID_IMAGE_URL');
    }
  }

  private validateTextToTextureParams(params: TextToTextureParams): void {
    if (!params.model_url) {
      throw new APIError('Model URL is required', 400, 'MISSING_MODEL_URL');
    }
    
    if (!params.prompt || params.prompt.length < 3) {
      throw new APIError('Prompt must be at least 3 characters long', 400, 'INVALID_PROMPT');
    }
    
    if (params.prompt.length > 600) {
      throw new APIError('Prompt must be less than 600 characters', 400, 'PROMPT_TOO_LONG');
    }

    // 验证模型URL格式
    try {
      new URL(params.model_url);
    } catch {
      throw new APIError('Invalid model URL format', 400, 'INVALID_MODEL_URL');
    }
  }

  private validateImageToTextureParams(params: ImageToTextureParams): void {
    if (!params.model_url) {
      throw new APIError('Model URL is required', 400, 'MISSING_MODEL_URL');
    }
    
    if (!params.image_style_url) {
      throw new APIError('Image style URL is required', 400, 'MISSING_IMAGE_STYLE_URL');
    }

    // 验证URL格式
    try {
      new URL(params.model_url);
      new URL(params.image_style_url);
    } catch {
      throw new APIError('Invalid URL format', 400, 'INVALID_URL');
    }
  }

  // 模拟API调用 (用于开发测试)
  async mockTextTo3D(params: TextTo3DParams): Promise<TaskResponse> {
    // 模拟API延迟
    await this.delay(500);
    
    return {
      result: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      estimated_time: 60,
      credits_used: params.mode === 'preview' ? 5 : 10,
    };
  }

  async mockTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    await this.delay(300);
    
    // 模拟不同的任务状态
    const statuses: Array<{status: any, progress: number}> = [
      { status: 'PENDING', progress: 0 },
      { status: 'IN_PROGRESS', progress: 25 },
      { status: 'IN_PROGRESS', progress: 50 },
      { status: 'IN_PROGRESS', progress: 75 },
      { status: 'SUCCEEDED', progress: 100 },
    ];
    
    // 基于taskId确定状态 (模拟)
    const hash = taskId.split('_')[1] || '0';
    const index = parseInt(hash.slice(-1)) % statuses.length;
    const currentStatus = statuses[index];
    
    const response: TaskStatusResponse = {
      id: taskId,
      mode: 'preview',
      name: '',
      seed: 78346591,
      art_style: 'realistic',
      texture_richness: '',
      prompt: '请生成一个黑曜石nft要求低调深沉',
      negative_prompt: '',
      texture_prompt: '',
      texture_image_url: '',
      status: currentStatus.status,
      created_at: 1737043080,
      progress: currentStatus.progress,
      started_at: currentStatus.status !== 'PENDING' ? 1737043081 : undefined,
      finished_at: currentStatus.status === 'SUCCEEDED' ? 1737043140 : undefined,
      task_error: null,
    };

    if (currentStatus.status === 'SUCCEEDED') {
      response.model_urls = {
        glb: 'https://models.readyplayer.me/647c6f35b88933e3db456fb7.glb',
        fbx: `https://mockcdn.meshy.ai/models/${taskId}.fbx`,
        obj: `https://mockcdn.meshy.ai/models/${taskId}.obj`,
        usdz: `https://mockcdn.meshy.ai/models/${taskId}.usdz`,
        mtl: `https://mockcdn.meshy.ai/models/${taskId}.mtl`,
      };
      response.thumbnail_url = `https://mockcdn.meshy.ai/previews/${taskId}.jpg`;
      response.video_url = `https://mockcdn.meshy.ai/videos/${taskId}.mp4`;
      response.texture_urls = [];
    }

    return response;
  }

  async mockBalance(): Promise<BalanceResponse> {
    await this.delay(200);
    return { balance: 150 };
  }
}