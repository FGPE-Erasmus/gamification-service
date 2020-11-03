import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { appConfig } from '../app.config';
import { ChallengeStatusModule } from '../challenge-status/challenge-status.module';
import { HookModule } from '../hook/hook.module';
import { PlayerModule } from '../player/player.module';
import { RewardModule } from '../reward/reward.module';
import { SubmissionModule } from '../submission/submission.module';
import { EventService } from './event.service';
import { EventListener } from './event.listener';
import { SubmissionProcessor } from './processors/submission.processor';
import { PlayerRewardModule } from '../player-reward/player-reward.module';
import { PlayerProcessor } from './processors/player.processor';
import { ChallengeModule } from '../challenge/challenge.module';
import { ChallengeProcessor } from './processors/challenge.processor';

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
    forwardRef(() => ChallengeModule),
    forwardRef(() => ChallengeStatusModule),
    forwardRef(() => HookModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => RewardModule),
    forwardRef(() => PlayerRewardModule),
    forwardRef(() => SubmissionModule),
  ],
  providers: [
    EventListener,
    EventService,

    // domain processors
    PlayerProcessor,
    SubmissionProcessor,
    ChallengeProcessor,
  ],
  exports: [EventService],
})
export class EventModule {}
