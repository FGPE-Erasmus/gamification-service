import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { ServiceHelper } from '../common/helpers/service.helper';
import { QueueConfigService } from '../queue.config';
import { QueueListener } from './queue.listener';
import { HookModule } from '../hook/hook.module';
import { RewardModule } from '../reward/reward.module';
import { JobProcessor } from './processors/job.processor';
import { PlayerModule } from 'src/player/player.module';
import { SubmissionModule } from 'src/submission/submission.module';
import { CriteriaHelper } from 'src/common/helpers/criteria.helper';

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
  providers: [ServiceHelper, CriteriaHelper, JobProcessor, QueueListener],
})
export class ProcessorModule {}
