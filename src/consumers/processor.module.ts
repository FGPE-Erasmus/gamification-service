import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { QueueConfigService } from '../queue.config';
import { QueueListener } from './queue.listener';
import { HookModule } from '../hook/hook.module';
import { PlayerModule } from '../player/player.module';
import { RewardModule } from '../reward/reward.module';
import { SubmissionModule } from '../submission/submission.module';
import { JobProcessor } from './processors/job.processor';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
    HookModule,
    RewardModule,
    PlayerModule,
    SubmissionModule,
  ],
  providers: [JobProcessor, QueueListener],
})
export class ProcessorModule {}
