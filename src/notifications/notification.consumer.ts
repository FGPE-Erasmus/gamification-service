import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { Queue, Job } from 'bull';
import { PubSub } from 'graphql-subscriptions';

import { appConfig } from '../app.config';
import { ChallengeStatusDto } from '../challenge-status/dto/challenge-status.dto';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { NotificationEnum } from '../common/enums/notifications.enum';
import { GameDto } from '../game/dto/game.dto';
import { LeaderboardDto } from '../leaderboard/dto/leaderboard.dto';
import { PlayerDto } from '../player/dto/player.dto';
import { RewardDto } from '../reward/dto/reward.dto';
import { SubmissionDto } from '../submission/dto/submission.dto';
import { ValidationDto } from '../submission/dto/validation.dto';

@Processor(appConfig.queue.notifications.name)
export class NotificationConsumer {
  protected readonly logger: Logger = new Logger(NotificationConsumer.name);

  constructor(@Inject('PUB_SUB') protected readonly pubSub: PubSub) {}

  @Process(NotificationEnum.NOTIFICATION_SENT)
  async onSentNotificationStudent(job: Job<unknown>): Promise<void> {
    const { type, payload, gameId } = job.data as { type: string; payload; gameId: string };

    switch (type) {
      case NotificationEnum.REWARD_RECEIVED:
        await this.pubSub.publish(NotificationEnum.REWARD_RECEIVED + '_STUDENT', {
          rewardReceivedStudent: payload as RewardDto,
          gameId: gameId,
        });

        await this.pubSub.publish(NotificationEnum.REWARD_RECEIVED + '_TEACHER', {
          rewardReceivedTeacher: payload as RewardDto,
          gameId: gameId,
        });
        break;
      case NotificationEnum.REWARD_REMOVED:
        await this.pubSub.publish(NotificationEnum.REWARD_REMOVED + '_STUDENT', {
          rewardRemovedStudent: payload as RewardDto,
          gameId: gameId,
        });

        await this.pubSub.publish(NotificationEnum.REWARD_REMOVED + '_TEACHER', {
          rewardRemovedTeacher: payload as RewardDto,
          gameId: gameId,
        });
        break;
      case NotificationEnum.REWARD_SUBSTRACTED:
        await this.pubSub.publish(NotificationEnum.REWARD_SUBSTRACTED + '_STUDENT', {
          rewardSubstractedStudent: payload as RewardDto,
          gameId: gameId,
        });

        await this.pubSub.publish(NotificationEnum.REWARD_SUBSTRACTED + '_TEACHER', {
          rewardSubstractedTeacher: payload as RewardDto,
          gameId: gameId,
        });
        break;
      case NotificationEnum.SUBMISSION_SENT:
        await this.pubSub.publish(NotificationEnum.SUBMISSION_SENT + '_STUDENT', {
          submissionSentStudent: payload as SubmissionDto,
        });

        await this.pubSub.publish(NotificationEnum.SUBMISSION_SENT + '_TEACHER', {
          submissionSentTeacher: payload as SubmissionDto,
        });
        break;
      case NotificationEnum.SUBMISSION_EVALUATED:
        await this.pubSub.publish(NotificationEnum.SUBMISSION_EVALUATED + '_STUDENT', {
          submissionEvaluatedStudent: payload as SubmissionDto,
        });

        await this.pubSub.publish(NotificationEnum.SUBMISSION_EVALUATED + '_TEACHER', {
          submissionEvaluatedTeacher: payload as SubmissionDto,
        });
        break;
      case NotificationEnum.VALIDATION_PROCESSED:
        console.log(payload);
        await this.pubSub.publish(NotificationEnum.VALIDATION_PROCESSED + '_STUDENT', {
          validationProcessedStudent: payload as ValidationDto,
        });

        await this.pubSub.publish(NotificationEnum.VALIDATION_PROCESSED + '_TEACHER', {
          validationProcessedTeacher: payload as ValidationDto,
        });
        break;
      case NotificationEnum.POINTS_UPDATED:
        await this.pubSub.publish(NotificationEnum.POINTS_UPDATED + '_STUDENT', {
          pointsUpdatedStudent: payload as PlayerDto,
        });
        await this.pubSub.publish(NotificationEnum.POINTS_UPDATED + '_TEACHER', {
          pointsUpdatedTeacher: payload as PlayerDto,
        });
        break;
      case NotificationEnum.CHALLENGE_STATUS_UPDATED:
        await this.pubSub.publish(NotificationEnum.CHALLENGE_STATUS_UPDATED + '_STUDENT', {
          challengeStatusUpdatedStudent: payload as ChallengeStatusDto,
          gameId: gameId,
        });

        await this.pubSub.publish(NotificationEnum.CHALLENGE_STATUS_UPDATED + '_TEACHER', {
          challengeStatusUpdatedTeacher: payload as ChallengeStatusDto,
          gameId: gameId,
        });
        break;
      case NotificationEnum.PLAYER_ENROLLED:
        await this.pubSub.publish(NotificationEnum.PLAYER_ENROLLED, {
          playerEnrolled: payload as PlayerDto,
        });
        break;
      case NotificationEnum.PLAYER_LEFT:
        await this.pubSub.publish(NotificationEnum.PLAYER_LEFT, {
          playerLeft: payload as PlayerDto,
        });
        break;
      case NotificationEnum.GAME_MODIFIED:
        await this.pubSub.publish(NotificationEnum.GAME_MODIFIED, {
          gameModified: payload as GameDto,
        });
        break;
      case NotificationEnum.CHALLENGE_MODIFIED:
        await this.pubSub.publish(NotificationEnum.CHALLENGE_MODIFIED, {
          challengeModified: payload as ChallengeDto,
        });
        break;
      case NotificationEnum.LEADERBOARD_MODIFIED:
        await this.pubSub.publish(NotificationEnum.LEADERBOARD_MODIFIED, {
          leaderboardModified: payload as LeaderboardDto,
        });
        break;
      case NotificationEnum.REWARD_MODIFIED:
        await this.pubSub.publish(NotificationEnum.REWARD_MODIFIED, {
          rewardModified: payload as RewardDto,
        });
        break;
      default:
        break;
    }
  }
}
