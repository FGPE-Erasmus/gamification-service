import { CacheModule as NestCacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

import { CacheService } from './cache.service';
import { appConfig } from '../app.config';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: appConfig.cacheManager.host,
        port: appConfig.cacheManager.port,
        ttl: appConfig.cacheManager.ttl,
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
