import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { ChallengeStatus } from './models/challenge-status.model';
import { State } from './models/state.enum';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';
import { ChallengeStatusToDtoMapper } from './mappers/challenge-status-to-dto.mapper';
import { ChallengeStatusToPersistenceMapper } from './mappers/challenge-status-to-persistence.mapper';

@Injectable()
export class ChallengeStatusService extends BaseService<ChallengeStatus> {
  constructor(
    protected readonly repository: ChallengeStatusRepository,
    protected readonly toDtoMapper: ChallengeStatusToDtoMapper,
    protected readonly toPersistenceMapper: ChallengeStatusToPersistenceMapper,
    @InjectQueue('hooksQueue') protected readonly hooksQueue: Queue,
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
    return this.findOne({
      challenge: challengeId,
      player: playerId,
    });
  }

  /**
   * Mark a challenge as open for a certain player.
   *
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which it was opened
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsOpen(challengeId: string, playerId: string, date: Date): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    return this.patch(temp.id, { state: State.OPENED, openedAt: date });
  }

  /**
   * Mark a challenge as failed for a certain player.
   *
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which the player failed it
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsFailed(challengeId: string, playerId: string, date: Date): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: State.FAILED, endedAt: date });

    // send CHALLENGE_FAILED message to execute attached hooks
    await this.hooksQueue.add(TriggerEvent.CHALLENGE_FAILED, {
      challengeId: challengeId,
      playerId: playerId,
    });

    return result;
  }

  /**
   * Mark a challenge as completed for a certain player.
   *
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which the player completed it
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsCompleted(playerId: string, challengeId: string, date: Date): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: State.COMPLETED, endedAt: date });

    // send CHALLENGE_COMPLETED message to execute attached hooks
    await this.hooksQueue.add(TriggerEvent.CHALLENGE_COMPLETED, {
      challengeId: challengeId,
      playerId: playerId,
    });

    return result;
  }

  /**
   * Mark a challenge as rejected by a certain player.
   *
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which the player rejected it
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsRejected(playerId: string, challengeId: string, date: Date): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: State.REJECTED, endedAt: date });

    // send CHALLENGE_REJECTED message to execute attached hooks
    await this.hooksQueue.add(TriggerEvent.CHALLENGE_REJECTED, {
      challengeId: challengeId,
      playerId: playerId,
    });

    return result;
  }
}
