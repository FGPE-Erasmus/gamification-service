import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';

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
import { RewardProcessor } from './processors/reward.processor';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { EventLogRepository } from './repositories/event-log.repository';
import { EventLogSchema } from './models/event-log.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'EventLog',
        schema: EventLogSchema,
      },
    ]),
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
    forwardRef(() => LeaderboardModule),
  ],
  providers: [
    EventListener,
    EventService,
    EventLogRepository,

    // domain processors
    ChallengeProcessor,
    PlayerProcessor,
    SubmissionProcessor,
    RewardProcessor,
  ],
  exports: [EventService, EventLogRepository],
})
export class EventModule {}
