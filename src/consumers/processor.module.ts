import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { ServiceHelper } from '../common/helpers/service.helper';
import { QueueConfigService } from '../queue.config';
import { QueueListener } from './queue.listener';
import { HookModule } from '../hook/hook.module';
import { RewardModule } from '../reward/reward.module';
import { JobProcessor } from './processors/job.processor';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
    HookModule,
    RewardModule,
  ],
  providers: [ServiceHelper, JobProcessor, QueueListener],
})
export class ProcessorModule {}
