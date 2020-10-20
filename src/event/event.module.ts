import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { appConfig } from '../app.config';
import { HookModule } from '../hook/hook.module';
import { PlayerModule } from '../player/player.module';
import { RewardModule } from '../reward/reward.module';
import { SubmissionModule } from '../submission/submission.module';
import { EventService } from './event.service';
import { EventProcessor } from './event.processor';
import { EventListener } from './event.listener';
import { SubmissionProcessor } from './processors/submission.processor';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: appConfig.queue.event.name,
      useFactory: () => ({
        redis: {
          host: appConfig.messageBroker.host,
          port: appConfig.messageBroker.port,
        },
        defaultJobOptions: { ...appConfig.queue.event.jobOptions },
      }),
    }),
    forwardRef(() => HookModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => RewardModule),
    forwardRef(() => SubmissionModule),
  ],
  providers: [
    EventListener,
    EventProcessor,
    EventService,

    // domain processors
    SubmissionProcessor,
  ],
  exports: [EventService],
})
export class EventModule {}
