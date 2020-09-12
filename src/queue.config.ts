import { Injectable } from '@nestjs/common';
import { BullOptionsFactory, BullModuleOptions } from '@nestjs/bull';

@Injectable()
export class QueueConfigService implements BullOptionsFactory {
  createBullOptions(): BullModuleOptions {
    return {
      redis: {
        host: 'redis',
        port: 6379,
      },
    };
  }
}
