import { Injectable } from '@nestjs/common';
import { BullOptionsFactory, BullModuleOptions } from '@nestjs/bull';
import { appConfig } from './app.config';

@Injectable()
export class QueueConfigService implements BullOptionsFactory {
  createBullOptions(): BullModuleOptions {
    return {
      redis: {
        host: appConfig.messageBroker.host,
        port: appConfig.messageBroker.port,
      },
    };
  }
}
