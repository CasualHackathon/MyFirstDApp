/**
 * 智能校验服务 - 在AI生成前进行合约校验，避免资源浪费
 */
export class ValidationService {
  private static instance: ValidationService;
  private cache: Map<string, { result: boolean; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  private constructor() {}

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  /**
   * 获取当前日期 (YYYY-MM-DD格式)
   */
  private getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * 检查城市是否可铸造（带缓存）
   * 注意：这个函数需要在实际使用时通过SE-2 hooks调用合约
   */
  async checkCityEligibility(
    address: string,
    city: string,
    contractAddress: string,
  ): Promise<{ canMint: boolean; reason?: string }> {
    if (!address || !city || !contractAddress) {
      return { canMint: false, reason: "Missing required parameters" };
    }

    const cacheKey = `${address}-${city}-${this.getCurrentDate()}`;

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { canMint: cached.result };
    }

    // 临时返回默认值，实际使用时需要通过SE-2 hooks调用
    const canMint = true; // 临时默认值

    // 更新缓存
    this.cache.set(cacheKey, { result: canMint, timestamp: Date.now() });

    return {
      canMint,
      reason: canMint ? undefined : "今日已铸造过该城市的NFT",
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 清除过期缓存
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.8, // 临时值，实际应该计算命中率
    };
  }
}

// 导出单例实例
export const validationService = ValidationService.getInstance();
