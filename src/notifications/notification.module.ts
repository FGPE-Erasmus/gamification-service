import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { appConfig } from '../app.config';
import { ChallengeStatusModule } from '../challenge-status/challenge-status.module';
import { PlayerModule } from '../player/player.module';
import { RewardModule } from '../reward/reward.module';
import { SubmissionModule } from '../submission/submission.module';
import { PlayerRewardModule } from '../player-reward/player-reward.module';
import { NotificationService } from './notification.service';
import { SubscriptionsModule } from 'src/common/subscriptions/subscriptions.module';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: appConfig.queue.notifications.name,
      useFactory: () => ({
        redis: {
          host: appConfig.messageBroker.host,
          port: appConfig.messageBroker.port,
        },
        defaultJobOptions: { ...appConfig.queue.notifications.jobOptions },
      }),
    }),
    forwardRef(() => ChallengeStatusModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => RewardModule),
    forwardRef(() => PlayerRewardModule),
    forwardRef(() => SubmissionModule),
    forwardRef(() => SubscriptionsModule),
  ],
  providers: [NotificationService, NotificationConsumer],
  exports: [NotificationService],
})
export class NotificationModule {}
