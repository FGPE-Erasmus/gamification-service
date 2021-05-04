import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { appConfig } from '../app.config';
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
    forwardRef(() => SubscriptionsModule),
  ],
  providers: [NotificationService, NotificationConsumer],
  exports: [NotificationService],
})
export class NotificationModule {}
