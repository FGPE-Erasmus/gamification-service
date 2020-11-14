import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { EventService } from '../event/event.service';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { ChallengeStatus } from './models/challenge-status.model';
import { StateEnum } from './models/state.enum';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';
import { toString } from '../common/utils/mongo.utils';

@Injectable()
export class ChallengeStatusService extends BaseService<ChallengeStatus> {
  constructor(protected readonly repository: ChallengeStatusRepository, protected readonly eventService: EventService) {
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
    const result: ChallengeStatus = await this.patch(temp.id, { state: StateEnum.COMPLETED, endedAt: date });

    // send CHALLENGE_COMPLETED message to execute attached hooks
    await this.eventService.fireEvent(TriggerEvent.CHALLENGE_COMPLETED, {
      gameId,
      playerId,
      challengeId,
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

    // send CHALLENGE_AVAILABLE message to execute attached hooks
    await this.eventService.fireEvent(TriggerEvent.CHALLENGE_AVAILABLE, {
      gameId,
      playerId,
      challengeId,
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

    return result;
  }
}
