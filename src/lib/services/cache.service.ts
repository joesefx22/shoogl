import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
  useMemory?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  memoryUsage?: string;
  keysCount: number;
  uptime: number;
}

class CacheService {
  private client: Redis | Map<string, any>;
  private prefix: string;
  private defaultTTL: number;
  private useMemory: boolean;
  private stats: {
    hits: number;
    misses: number;
    startedAt: number;
  };
  private memoryCache: Map<string, { data: any; expiresAt: number }> = new Map();

  constructor(options: CacheOptions = {}) {
    this.prefix = options.prefix || 'ehgzly:cache:';
    this.defaultTTL = options.ttl || 5 * 60; // 5 دقائق افتراضياً
    this.useMemory = options.useMemory || false;
    this.stats = {
      hits: 0,
      misses: 0,
      startedAt: Date.now(),
    };

    // تهيئة التخزين المؤقت
    if (process.env.REDIS_URL && !this.useMemory) {
      // استخدام Redis في الإنتاج
      this.client = new Redis(process.env.REDIS_URL, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      // إضافة مستمعات للأخطاء
      (this.client as Redis).on('error', (error) => {
        console.error('Redis connection error:', error);
        // Fallback to memory cache
        this.fallbackToMemory();
      });

      (this.client as Redis).on('connect', () => {
        console.log('Redis cache connected successfully');
      });
    } else {
      // استخدام الذاكرة في التطوير
      this.client = this.memoryCache;
      console.log('Using memory cache for development');
    }
  }

  private fallbackToMemory(): void {
    console.log('Falling back to memory cache');
    this.client = this.memoryCache;
    this.useMemory = true;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private serialize(value: any): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error('Cache serialization error:', error);
      throw new Error('Failed to serialize cache value');
    }
  }

  private deserialize<T>(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache deserialization error:', error);
      throw new Error('Failed to deserialize cache value');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.getKey(key);

    try {
      if (this.useMemory || this.client instanceof Map) {
        const item = this.memoryCache.get(cacheKey);
        
        if (!item) {
          this.stats.misses++;
          return null;
        }

        if (Date.now() > item.expiresAt) {
          this.memoryCache.delete(cacheKey);
          this.stats.misses++;
          return null;
        }

        this.stats.hits++;
        return item.data as T;
      }

      // استخدام Redis
      const value = await (this.client as Redis).get(cacheKey);
      
      if (!value) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return this.deserialize<T>(value);
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const cacheKey = this.getKey(key);
    const expiresIn = ttl || this.defaultTTL;

    try {
      if (this.useMemory || this.client instanceof Map) {
        this.memoryCache.set(cacheKey, {
          data: value,
          expiresAt: Date.now() + expiresIn * 1000,
        });
        return true;
      }

      // استخدام Redis
      const serialized = this.serialize(value);
      if (expiresIn > 0) {
        await (this.client as Redis).setex(cacheKey, expiresIn, serialized);
      } else {
        await (this.client as Redis).set(cacheKey, serialized);
      }
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      // Fallback to memory cache
      if (!this.useMemory) {
        this.fallbackToMemory();
        return this.set(key, value, ttl);
      }
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    const cacheKey = this.getKey(key);

    try {
      if (this.useMemory || this.client instanceof Map) {
        return this.memoryCache.delete(cacheKey);
      }

      const result = await (this.client as Redis).del(cacheKey);
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    const cacheKey = this.getKey(key);

    try {
      if (this.useMemory || this.client instanceof Map) {
        const item = this.memoryCache.get(cacheKey);
        if (!item) return false;
        
        if (Date.now() > item.expiresAt) {
          this.memoryCache.delete(cacheKey);
          return false;
        }
        
        return true;
      }

      const result = await (this.client as Redis).exists(cacheKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttl);
    
    return data;
  }

  async invalidate(pattern: string): Promise<number> {
    try {
      if (this.useMemory || this.client instanceof Map) {
        let deletedCount = 0;
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern)) {
            this.memoryCache.delete(key);
            deletedCount++;
          }
        }
        return deletedCount;
      }

      const keys = await (this.client as Redis).keys(`${this.prefix}${pattern}*`);
      if (keys.length > 0) {
        const result = await (this.client as Redis).del(...keys);
        return result;
      }
      
      return 0;
    } catch (error) {
      console.error('Cache invalidate error:', error);
      return 0;
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.useMemory || this.client instanceof Map) {
        this.memoryCache.clear();
        return;
      }

      const keys = await (this.client as Redis).keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await (this.client as Redis).del(...keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  async getStats(): Promise<CacheStats> {
    let memoryUsage: string | undefined;
    let keysCount = 0;

    try {
      if (this.useMemory || this.client instanceof Map) {
        keysCount = this.memoryCache.size;
        // حساب استخدام الذاكرة التقريبي
        let totalSize = 0;
        for (const [key, value] of this.memoryCache.entries()) {
          totalSize += key.length * 2;
          totalSize += new Blob([JSON.stringify(value)]).size;
        }
        memoryUsage = `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
      } else {
        keysCount = await (this.client as Redis).keys(`${this.prefix}*`).then(keys => keys.length);
        const info = await (this.client as Redis).info('memory');
        const usedMemory = info.match(/used_memory:(\d+)/)?.[1];
        if (usedMemory) {
          memoryUsage = `${(parseInt(usedMemory) / 1024 / 1024).toFixed(2)} MB`;
        }
      }
    } catch (error) {
      console.error('Cache stats error:', error);
    }

    const hits = this.stats.hits;
    const misses = this.stats.misses;
    const total = hits + misses;
    const hitRate = total > 0 ? ((hits / total) * 100).toFixed(2) : '0.00';

    return {
      hits,
      misses,
      memoryUsage,
      keysCount,
      uptime: Date.now() - this.stats.startedAt,
      hitRate: `${hitRate}%`,
    };
  }

  // طرق مساعدة لتخزين أنواع محددة من البيانات
  async cacheStadiumData(stadiumId: string, data: any): Promise<boolean> {
    return this.set(`stadium:${stadiumId}`, data, 10 * 60); // 10 دقائق للملعب
  }

  async getStadiumData(stadiumId: string): Promise<any | null> {
    return this.get(`stadium:${stadiumId}`);
  }

  async cacheUserSessions(userId: string, data: any): Promise<boolean> {
    return this.set(`user:${userId}:sessions`, data, 30 * 60); // 30 دقيقة للجلسات
  }

  async cacheApiResponse(endpoint: string, params: any, data: any): Promise<boolean> {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return this.set(key, data, 2 * 60); // 2 دقيقة للاستجابات API
  }

  async invalidateUserData(userId: string): Promise<number> {
    return this.invalidate(`user:${userId}`);
  }

  async invalidateStadiumData(stadiumId: string): Promise<number> {
    return this.invalidate(`stadium:${stadiumId}`);
  }

  async cacheWithTags(key: string, value: any, tags: string[], ttl?: number): Promise<boolean> {
    const success = await this.set(key, value, ttl);
    
    if (success) {
      // تخزين العلاقات بين الكاش والتاجات
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const items = await this.get<string[]>(tagKey) || [];
        items.push(key);
        await this.set(tagKey, items, ttl);
      }
    }
    
    return success;
  }

  async invalidateByTag(tag: string): Promise<number> {
    const tagKey = `tag:${tag}`;
    const items = await this.get<string[]>(tagKey) || [];
    
    let deletedCount = 0;
    for (const item of items) {
      if (await this.delete(item)) {
        deletedCount++;
      }
    }
    
    await this.delete(tagKey);
    return deletedCount;
  }

  // Clean up expired items (for memory cache)
  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }

  // تنظيف دوري للذاكرة المؤقتة
  startCleanupInterval(interval: number = 5 * 60 * 1000): void {
    setInterval(() => {
      if (this.useMemory || this.client instanceof Map) {
        this.cleanupMemoryCache();
      }
    }, interval);
  }

  async disconnect(): Promise<void> {
    if (!this.useMemory && this.client instanceof Redis) {
      await this.client.quit();
    }
  }
}

// Singleton instance for global use
let cacheInstance: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!cacheInstance) {
    cacheInstance = new CacheService({
      ttl: parseInt(process.env.CACHE_TTL || '300'),
      prefix: process.env.CACHE_PREFIX || 'ehgzly:cache:',
      useMemory: process.env.NODE_ENV !== 'production',
    });
    
    // بدء التنظيف الدوري
    cacheInstance.startCleanupInterval();
  }
  return cacheInstance;
}

// Helper function for React Query cache
export function getQueryCacheKey(endpoint: string, params?: any): string {
  if (!params) return endpoint;
  return `${endpoint}:${JSON.stringify(params)}`;
}

// Cache middleware for API routes
export function withCache(handler: Function, options: {
  key: string;
  ttl?: number;
  tags?: string[];
} = { key: '', ttl: 300 }) {
  return async (...args: any[]) => {
    const cache = getCacheService();
    
    // توليد مفتاح الكاش إذا لم يتم توفيره
    const cacheKey = options.key || `api:${handler.name}:${JSON.stringify(args)}`;
    
    // محاولة جلب البيانات من الكاش
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // تنفيذ الـ handler الأصلي
    const result = await handler(...args);
    
    // تخزين النتيجة في الكاش
    if (options.tags) {
      await cache.cacheWithTags(cacheKey, result, options.tags, options.ttl);
    } else {
      await cache.set(cacheKey, result, options.ttl);
    }
    
    return result;
  };
}

export default CacheService;
