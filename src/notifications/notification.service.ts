import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { PubSub } from 'graphql-subscriptions';

import { appConfig } from '../app.config';
import { ChallengeStatusToDtoMapper } from '../challenge-status/mappers/challenge-status-to-dto.mapper';
import { NotificationEnum } from '../common/enums/notifications.enum';
import { PlayerRewardToDtoMapper } from '../player-reward/mappers/player-reward-to-dto.mapper';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { SubmissionToDtoMapper } from '../submission/mappers/submission-to-dto.mapper';
import { ValidationToDtoMapper } from '../submission/mappers/validation-to-dto.mapper';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    @InjectQueue(appConfig.queue.notifications.name) protected readonly notificationQueue: Queue,
    protected readonly challengeStatusToDtoMapper: ChallengeStatusToDtoMapper,
    protected readonly playerRewardToDtoMapper: PlayerRewardToDtoMapper,
    protected readonly submissionToDtoMapper: SubmissionToDtoMapper,
    protected readonly validationToDtoMapper: ValidationToDtoMapper,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
  ) {}

  async sendNotification(type: string, payload: any, gameId?: string) {
    let payloadDto;
    if (type.startsWith('REWARD')) payloadDto = await this.playerRewardToDtoMapper.transform(payload);
    else if (type.startsWith('SUBMISSION')) payloadDto = await this.submissionToDtoMapper.transform(payload);
    else if (type.startsWith('VALIDATION')) payloadDto = await this.validationToDtoMapper.transform(payload);
    else if (type.startsWith('PLAYER') || type.startsWith('POINTS'))
      payloadDto = await this.playerToDtoMapper.transform(payload);
    else if (type.startsWith('CHALLENGE_STATUS')) payloadDto = await this.challengeStatusToDtoMapper.transform(payload);
    else payloadDto = payload;

    this.notificationQueue.add(NotificationEnum.NOTIFICATION_SENT, {
      type: type,
      gameId: gameId,
      payload: payload,
    });
  }
}
