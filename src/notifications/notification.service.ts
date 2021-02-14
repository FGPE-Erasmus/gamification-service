import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { PubSub } from 'graphql-subscriptions';

import { appConfig } from '../app.config';
import { NotificationEnum } from '../common/enums/notifications.enum';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    @InjectQueue(appConfig.queue.notifications.name) protected readonly notificationQueue: Queue,
  ) {}

  sendNotification(type: string, payloadDto: any, gameId?: string) {
    this.notificationQueue.add(NotificationEnum.NOTIFICATION_SENT, {
      type: type,
      gameId: gameId,
      payload: payloadDto,
    });
  }
}
