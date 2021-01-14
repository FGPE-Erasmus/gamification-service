import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

import { Mode } from 'src/challenge/models/mode.enum';
import { ScheduledHookService } from 'src/hook/scheduled-hook.service';
import { NotificationEnum } from '../common/enums/notifications.enum';
import { BaseService } from '../common/services/base.service';
import { EventService } from '../event/event.service';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { ChallengeStatusToDtoMapper } from './mappers/challenge-status-to-dto.mapper';
import { ChallengeStatus, ChallengeStatusDocument } from './models/challenge-status.model';
import { StateEnum } from './models/state.enum';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';
import { ChallengeDto } from 'src/challenge/dto/challenge.dto';
import { Challenge } from '../challenge/models/challenge.model';
import { ChallengeService } from '../challenge/challenge.service';
import { ActivityService } from '../evaluation-engine/activity.service';

@Injectable()
export class ChallengeStatusService extends BaseService<ChallengeStatus, ChallengeStatusDocument> {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    @Inject(forwardRef(() => ChallengeService))
    protected readonly challengeService: ChallengeService,
    protected readonly scheduledHookService: ScheduledHookService,
    protected readonly challengeStatusToDtoMapper: ChallengeStatusToDtoMapper,
    protected readonly repository: ChallengeStatusRepository,
    protected readonly eventService: EventService,
    protected readonly activityService: ActivityService,
  ) {
    super(new Logger(ChallengeStatusService.name), repository);
  }

  /**
   * Find the status of a challenge by challenge ID and player ID.
   *
   * @param {string} challengeId the ID of the challenge
   * @param {string} playerId the ID of the player
   * @returns {ChallengeStatus} the challenge status
   */
  async findByChallengeIdAndPlayerId(challengeId: string, playerId: string): Promise<ChallengeStatus> {
    return await this.findOne({
      challenge: { $eq: challengeId },
      player: { $eq: playerId },
    });
  }

  /**
   * Mark a challenge as open for a certain player.
   *
   * @param {string} gameId the ID of the game
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which it was opened
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsOpen(gameId: string, challengeId: string, playerId: string, date: Date): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: StateEnum.OPENED, openedAt: date });

    // send CHALLENGE_OPENED message to execute attached hooks
    await this.eventService.fireEvent(TriggerEvent.CHALLENGE_OPENED, {
      gameId,
      playerId,
      challengeId,
    });

    await this.pubSub.publish(NotificationEnum.CHALLENGE_STATUS_UPDATED, {
      challengeStatusUpdated: this.challengeStatusToDtoMapper.transform(result),
    });

    return result;
  }

  /**
   * Mark a challenge as failed for a certain player.
   *
   * @param {string} gameId the ID of the game
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which the player failed it
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsFailed(gameId: string, challengeId: string, playerId: string, date: Date): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: StateEnum.FAILED, endedAt: date });

    // send CHALLENGE_FAILED message to execute attached hooks
    await this.eventService.fireEvent(TriggerEvent.CHALLENGE_FAILED, {
      gameId,
      playerId,
      challengeId,
    });

    await this.pubSub.publish(NotificationEnum.CHALLENGE_STATUS_UPDATED, {
      challengeStatusUpdated: this.challengeStatusToDtoMapper.transform(result),
    });

    return result;
  }

  /**
   * Mark a challenge as completed for a certain player.
   *
   * @param {string} gameId the ID of the game
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which the player completed it
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsCompleted(gameId: string, challengeId: string, playerId: string, date: Date): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    if (temp.state === StateEnum.COMPLETED || temp.state === StateEnum.HIDDEN || temp.state === StateEnum.LOCKED) {
      return;
    }
    const result: ChallengeStatus = await this.patch(temp.id, { state: StateEnum.COMPLETED, endedAt: date });

    // send CHALLENGE_COMPLETED message to execute attached hooks
    await this.eventService.fireEvent(TriggerEvent.CHALLENGE_COMPLETED, {
      gameId,
      playerId,
      challengeId,
    });

    await this.pubSub.publish(NotificationEnum.CHALLENGE_STATUS_UPDATED, {
      challengeStatusUpdated: this.challengeStatusToDtoMapper.transform(result),
    });

    return result;
  }

  /**
   * Mark a challenge as rejected by a certain player.
   *
   * @param {string} gameId the ID of the game
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which the player rejected it
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsRejected(gameId: string, challengeId: string, playerId: string, date: Date): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: StateEnum.REJECTED, endedAt: date });

    // send CHALLENGE_REJECTED message to execute attached hooks
    await this.eventService.fireEvent(TriggerEvent.CHALLENGE_REJECTED, {
      gameId,
      playerId,
      challengeId,
    });

    await this.pubSub.publish(NotificationEnum.CHALLENGE_STATUS_UPDATED, {
      challengeStatusUpdated: this.challengeStatusToDtoMapper.transform(result),
    });

    return result;
  }

  /**
   * Mark a challenge as available by a certain player.
   *
   * @param {string} gameId the ID of the game
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsAvailable(gameId: string, challengeId: string, playerId: string): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: StateEnum.AVAILABLE });
    const challenge: Challenge = await this.challengeService.findById(challengeId);

    if (challenge.mode === Mode.TIME_BOMB) await this.scheduledHookService.createTimebombHook(challenge, playerId);

    // send CHALLENGE_AVAILABLE message to execute attached hooks
    await this.eventService.fireEvent(TriggerEvent.CHALLENGE_AVAILABLE, {
      gameId,
      playerId,
      challengeId,
    });

    await this.pubSub.publish(NotificationEnum.CHALLENGE_STATUS_UPDATED, {
      challengeStatusUpdated: this.challengeStatusToDtoMapper.transform(result),
    });

    return result;
  }

  /**
   * Mark a challenge as hidden by a certain player.
   *
   * @param {string} gameId the ID of the game
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsHidden(gameId: string, challengeId: string, playerId: string): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: StateEnum.HIDDEN });

    // send CHALLENGE_REJECTED message to execute attached hooks
    await this.eventService.fireEvent(TriggerEvent.CHALLENGE_REJECTED, {
      gameId,
      playerId,
      challengeId,
    });

    await this.pubSub.publish(NotificationEnum.CHALLENGE_STATUS_UPDATED, {
      challengeStatusUpdated: this.challengeStatusToDtoMapper.transform(result),
    });

    return result;
  }

  /**
   * Mark a challenge as locked by a certain player.
   *
   * @param {string} gameId the ID of the game
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsLocked(gameId: string, challengeId: string, playerId: string): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: StateEnum.LOCKED });

    // send CHALLENGE_LOCKED message to execute attached hooks
    await this.eventService.fireEvent(TriggerEvent.CHALLENGE_LOCKED, {
      gameId,
      playerId,
      challengeId,
    });

    await this.pubSub.publish(NotificationEnum.CHALLENGE_STATUS_UPDATED, {
      challengeStatusUpdated: this.challengeStatusToDtoMapper.transform(result),
    });

    return result;
  }

  async getCurrentShape(challenge: ChallengeDto, playerId: string): Promise<string> {
    const challengeStatus: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challenge.id, playerId);
    const refIndex =
      ((Date.now() - challengeStatus.openedAt.getTime()) / +challenge.modeParameters[0]) % challenge.refs.length;
    return challenge.refs[refIndex];
  }

  /**
   * Estimate the progress of the player in the challenge.
   *
   * @param {string} gameId the ID of the game
   * @param {string} challengeId the ID of the challenge
   * @param {string} playerId the ID of the player
   * @returns {number} the progress of the player in the challenge.
   */
  async progress(gameId: string, challengeId: string, playerId: string): Promise<number> {
    const challenge: Challenge = await this.challengeService.findById(challengeId);
    return this.challengeProgress(challenge, playerId);
  }

  /**
   * Estimate the progress of the player in the challenge.
   *
   * @param {Challenge} challenge the challenge
   * @param {string} playerId the ID of the player
   * @returns {number} the progress of the player in the challenge.
   */
  async challengeProgress(challenge: Challenge, playerId: string): Promise<number> {
    const challengeStatus: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challenge.id, playerId);
    if (challengeStatus.state === StateEnum.COMPLETED) {
      return 1;
    } else if (challengeStatus.state === StateEnum.HIDDEN || challengeStatus.state === StateEnum.FAILED) {
      return 0;
    }
    const activities: string[] = challenge.refs;
    const children: Challenge[] = await this.challengeService.findByParentChallengeId(challenge.game, challenge.id);
    if (activities.length === 0 && children.length === 0) {
      return 1;
    }
    const sliceValue = 1 / (activities.length + children.length);
    let progress = 0;
    for (const activityId of activities) {
      if (await this.activityService.isActivitySolved(challenge.game, activityId, playerId)) {
        progress += sliceValue;
      }
    }
    for (const child of children) {
      progress += sliceValue * (await this.challengeProgress(child, playerId));
    }
    return progress;
  }
}
