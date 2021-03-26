import { Process, Processor } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { PubSub } from 'graphql-subscriptions';

import { PlayerRewardDto } from '../player-reward/dto/player-reward.dto';
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
  async onSentNotification(job: Job<unknown>): Promise<void> {
    const { type, payload, gameId } = job.data as { type: string; payload; gameId: string };

    switch (type) {
      case NotificationEnum.REWARD_RECEIVED:
        this.pubSub.publish(NotificationEnum.REWARD_RECEIVED + '_STUDENT', {
          rewardReceivedStudent: payload as PlayerRewardDto,
          gameId: gameId,
        });

        this.pubSub.publish(NotificationEnum.REWARD_RECEIVED + '_TEACHER', {
          rewardReceivedTeacher: payload as PlayerRewardDto,
          gameId: gameId,
        });
        break;
      case NotificationEnum.REWARD_REMOVED:
        this.pubSub.publish(NotificationEnum.REWARD_REMOVED + '_STUDENT', {
          rewardRemovedStudent: payload as PlayerRewardDto,
          gameId: gameId,
        });

        this.pubSub.publish(NotificationEnum.REWARD_REMOVED + '_TEACHER', {
          rewardRemovedTeacher: payload as PlayerRewardDto,
          gameId: gameId,
        });
        break;
      case NotificationEnum.REWARD_SUBSTRACTED:
        this.pubSub.publish(NotificationEnum.REWARD_SUBSTRACTED + '_STUDENT', {
          rewardSubstractedStudent: payload as PlayerRewardDto,
          gameId: gameId,
        });

        this.pubSub.publish(NotificationEnum.REWARD_SUBSTRACTED + '_TEACHER', {
          rewardSubstractedTeacher: payload as PlayerRewardDto,
          gameId: gameId,
        });
        break;
      case NotificationEnum.SUBMISSION_SENT:
        this.pubSub.publish(NotificationEnum.SUBMISSION_SENT + '_STUDENT', {
          submissionSentStudent: payload as SubmissionDto,
        });

        this.pubSub.publish(NotificationEnum.SUBMISSION_SENT + '_TEACHER', {
          submissionSentTeacher: payload as SubmissionDto,
        });
        break;
      case NotificationEnum.SUBMISSION_EVALUATED:
        this.pubSub.publish(NotificationEnum.SUBMISSION_EVALUATED + '_STUDENT', {
          submissionEvaluatedStudent: payload as SubmissionDto,
        });

        this.pubSub.publish(NotificationEnum.SUBMISSION_EVALUATED + '_TEACHER', {
          submissionEvaluatedTeacher: payload as SubmissionDto,
        });
        break;
      case NotificationEnum.VALIDATION_PROCESSED:
        this.pubSub.publish(NotificationEnum.VALIDATION_PROCESSED + '_STUDENT', {
          validationProcessedStudent: payload as ValidationDto,
        });

        this.pubSub.publish(NotificationEnum.VALIDATION_PROCESSED + '_TEACHER', {
          validationProcessedTeacher: payload as ValidationDto,
        });
        break;
      case NotificationEnum.POINTS_UPDATED:
        this.pubSub.publish(NotificationEnum.POINTS_UPDATED + '_STUDENT', {
          pointsUpdatedStudent: payload as PlayerDto,
        });
        this.pubSub.publish(NotificationEnum.POINTS_UPDATED + '_TEACHER', {
          pointsUpdatedTeacher: payload as PlayerDto,
        });
        break;
      case NotificationEnum.CHALLENGE_STATUS_UPDATED:
        this.pubSub.publish(NotificationEnum.CHALLENGE_STATUS_UPDATED + '_STUDENT', {
          challengeStatusUpdatedStudent: payload as ChallengeStatusDto,
          gameId: gameId,
        });

        this.pubSub.publish(NotificationEnum.CHALLENGE_STATUS_UPDATED + '_TEACHER', {
          challengeStatusUpdatedTeacher: payload as ChallengeStatusDto,
          gameId: gameId,
        });
        break;
      case NotificationEnum.PLAYER_ENROLLED:
        this.pubSub.publish(NotificationEnum.PLAYER_ENROLLED, {
          playerEnrolled: payload as PlayerDto,
        });
        break;
      case NotificationEnum.PLAYER_LEFT:
        this.pubSub.publish(NotificationEnum.PLAYER_LEFT, {
          playerLeft: payload as PlayerDto,
        });
        break;
      case NotificationEnum.GAME_MODIFIED:
        this.pubSub.publish(NotificationEnum.GAME_MODIFIED, {
          gameModified: payload as GameDto,
        });
        break;
      case NotificationEnum.CHALLENGE_MODIFIED:
        this.pubSub.publish(NotificationEnum.CHALLENGE_MODIFIED, {
          challengeModified: payload as ChallengeDto,
        });
        break;
      case NotificationEnum.LEADERBOARD_MODIFIED:
        this.pubSub.publish(NotificationEnum.LEADERBOARD_MODIFIED, {
          leaderboardModified: payload as LeaderboardDto,
        });
        break;
      case NotificationEnum.REWARD_MODIFIED:
        this.pubSub.publish(NotificationEnum.REWARD_MODIFIED, {
          rewardModified: payload as RewardDto,
        });
        break;
      case NotificationEnum.GAME_STARTED:
        this.pubSub.publish(NotificationEnum.GAME_STARTED, {
          gameStarted: payload as GameDto,
        });
        break;
      case NotificationEnum.GAME_FINISHED:
        this.pubSub.publish(NotificationEnum.GAME_FINISHED, {
          gameFinished: payload as GameDto,
        });
        break;
      default:
        break;
    }
  }
}
