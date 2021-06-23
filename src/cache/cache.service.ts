import { CACHE_MANAGER, forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager-redis-store';

@Injectable()
export class CacheService {
  constructor(@Inject(forwardRef(() => CACHE_MANAGER)) private readonly cache: Cache) {}

  async get(key: string): Promise<any> {
    return await this.cache.get(key);
  }

  async getMany(keys: string[]): Promise<any[]> {
    return await this.cache.mget(keys);
  }

  async set(key: string, value: unknown): Promise<void> {
    return await this.cache.set(key, value);
  }

  async invalidate(key: string): Promise<void> {
    return await this.cache.del(key);
  }
}
