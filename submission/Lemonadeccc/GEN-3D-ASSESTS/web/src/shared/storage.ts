// localStorage工具函数 - 安全的SSR兼容版本
const STORAGE_KEYS = {
  CURRENT_TASK: 'meshy_current_task',
  PREVIEW_TASK_ID: 'meshy_preview_task_id',
  TEXTURE_TASK_ID: 'meshy_texture_task_id',
  LAST_SUCCESSFUL_MODEL: 'meshy_last_model',
  ALL_SUCCESSFUL_MODELS: 'meshy_all_successful_models', // 新增：所有成功的模型
  MINTED_MODELS: 'meshy_minted_models', // 新增：已铸造的模型记录
  GENERATION_HISTORY: 'meshy_generation_history',
} as const;

// 检查是否在客户端环境
const isClient = typeof window !== 'undefined';

export const storage = {
  // 保存当前任务
  saveCurrentTask(taskId: string): void {
    if (!isClient) return;
    try {
      if (taskId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_TASK, taskId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_TASK);
      }
    } catch (e) {
      console.error('Failed to save task ID:', e);
    }
  },

  // 获取当前任务 - SSR安全
  getCurrentTask(): string | null {
    if (!isClient) return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_TASK);
    } catch (e) {
      console.error('Failed to get task ID:', e);
      return null;
    }
  },

  // 保存预览任务ID（用于refine模式）
  savePreviewTaskId(taskId: string): void {
    if (!isClient) return;
    try {
      if (taskId) {
        localStorage.setItem(STORAGE_KEYS.PREVIEW_TASK_ID, taskId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.PREVIEW_TASK_ID);
      }
    } catch (e) {
      console.error('Failed to save preview task ID:', e);
    }
  },

  // 获取预览任务ID - SSR安全
  getPreviewTaskId(): string | null {
    if (!isClient) return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.PREVIEW_TASK_ID);
    } catch (e) {
      console.error('Failed to get preview task ID:', e);
      return null;
    }
  },

  // 保存纹理任务ID
  saveTextureTaskId(taskId: string): void {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TEXTURE_TASK_ID, taskId);
    } catch (e) {
      console.error('Failed to save texture task ID:', e);
    }
  },

  // 获取纹理任务ID - SSR安全
  getTextureTaskId(): string | null {
    if (!isClient) return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.TEXTURE_TASK_ID);
    } catch (e) {
      console.error('Failed to get texture task ID:', e);
      return null;
    }
  },

  // 保存最后成功的模型数据
  saveLastSuccessfulModel(data: any): void {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SUCCESSFUL_MODEL, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save model data:', e);
    }
  },

  // 获取最后成功的模型数据 - SSR安全
  getLastSuccessfulModel(): any | null {
    if (!isClient) return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_SUCCESSFUL_MODEL);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to get model data:', e);
      return null;
    }
  },

  // 保存生成历史
  saveGenerationHistory(history: string[]): void {
    if (!isClient) return;
    try {
      // 只保留最近50个
      const limitedHistory = history.slice(-50);
      localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(limitedHistory));
    } catch (e) {
      console.error('Failed to save generation history:', e);
    }
  },

  // 获取生成历史 - SSR安全
  getGenerationHistory(): string[] {
    if (!isClient) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GENERATION_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to get generation history:', e);
      return [];
    }
  },

  // 清除所有存储
  clearAll(): void {
    if (!isClient) return;
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  },

  // ====== 新增：多模型管理功能 ======

  // 添加成功的模型到列表中
  addSuccessfulModel(model: any): void {
    if (!isClient) return;
    try {
      const existingModels = this.getAllSuccessfulModels();
      // 检查是否已存在（避免重复）
      const exists = existingModels.some(m => m.id === model.id);
      if (!exists) {
        const updatedModels = [...existingModels, model];
        // 只保留最近50个模型
        const limitedModels = updatedModels.slice(-50);
        localStorage.setItem(STORAGE_KEYS.ALL_SUCCESSFUL_MODELS, JSON.stringify(limitedModels));
        
        // 同时更新最后成功的模型
        this.saveLastSuccessfulModel(model);
      }
    } catch (e) {
      console.error('Failed to add successful model:', e);
    }
  },

  // 获取所有成功的模型
  getAllSuccessfulModels(): any[] {
    if (!isClient) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALL_SUCCESSFUL_MODELS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to get all successful models:', e);
      return [];
    }
  },

  // 标记模型为已铸造
  markModelAsMinted(taskId: string, nftData?: { tokenId: number; transactionHash: string }): void {
    if (!isClient) return;
    try {
      const mintedModels = this.getMintedModels();
      const mintRecord = {
        taskId,
        mintedAt: Date.now(),
        ...nftData
      };
      
      // 检查是否已存在
      if (!mintedModels.some(m => m.taskId === taskId)) {
        mintedModels.push(mintRecord);
        localStorage.setItem(STORAGE_KEYS.MINTED_MODELS, JSON.stringify(mintedModels));
      }
    } catch (e) {
      console.error('Failed to mark model as minted:', e);
    }
  },

  // 获取已铸造的模型记录
  getMintedModels(): Array<{ taskId: string; mintedAt: number; tokenId?: number; transactionHash?: string }> {
    if (!isClient) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MINTED_MODELS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to get minted models:', e);
      return [];
    }
  },

  // 检查模型是否已铸造
  isModelMinted(taskId: string): boolean {
    if (!isClient) return false;
    try {
      const mintedModels = this.getMintedModels();
      return mintedModels.some(m => m.taskId === taskId);
    } catch (e) {
      console.error('Failed to check minted status:', e);
      return false;
    }
  },

  // 获取待铸造的模型（已成功但未铸造）
  getReadyToMintModels(): any[] {
    if (!isClient) return [];
    try {
      const allSuccessful = this.getAllSuccessfulModels();
      const mintedModels = this.getMintedModels();
      
      // 过滤出未铸造的模型
      return allSuccessful.filter(model => 
        model.status === 'SUCCEEDED' && 
        !mintedModels.some(minted => minted.taskId === model.id)
      );
    } catch (e) {
      console.error('Failed to get ready to mint models:', e);
      return [];
    }
  },

  // 清除已铸造模型记录（可选，用于重置）
  clearMintedModels(): void {
    if (!isClient) return;
    try {
      localStorage.removeItem(STORAGE_KEYS.MINTED_MODELS);
    } catch (e) {
      console.error('Failed to clear minted models:', e);
    }
  }
};