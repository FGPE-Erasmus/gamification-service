import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { ChallengeStatus } from './models/challenge-status.model';
import { State } from './models/state.enum';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';
import { ActionHook } from 'src/hook/models/action-hook.model';
import { ActionHookService } from 'src/hook/action-hook.service';

@Injectable()
export class ChallengeStatusService extends BaseService<ChallengeStatus> {
  constructor(
    protected readonly repository: ChallengeStatusRepository,
    @InjectQueue('hooksQueue') protected readonly hooksQueue: Queue,
    protected readonly actionHookService: ActionHookService,
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
    const result: ChallengeStatus = await this.patch(temp.id, { state: State.OPENED, openedAt: date });
    const hooks: ActionHook[] = await this.actionHookService.findAll({
      $and: [{ trigger: { $eq: TriggerEvent.CHALLENGE_OPENED } }, { sourceId: { $eq: challengeId } }],
    });
    //send CHALLENGE_OPENED message to execute attached hooks
    for (const hook of hooks) {
      const job = await this.hooksQueue.add({
        hook: hook,
        params: {
          challengeId: challengeId,
          playerId: playerId,
        },
      });
      this.logger.debug(`Job ${job.id} added to the queue (hook: ${hook.id})`);
    }

    return result;
  }

  /**
   * Mark a challenge as failed for a certain player.
   *
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which the player failed it
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsFailed(challengeId: string, playerId: string): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: State.FAILED });
    const hooks: ActionHook[] = await this.actionHookService.findAll({
      $and: [{ trigger: { $eq: TriggerEvent.CHALLENGE_FAILED } }, { sourceId: { $eq: challengeId } }],
    });
    //send CHALLENGE_FAILED message to execute attached hooks
    for (const hook of hooks) {
      const job = await this.hooksQueue.add({
        hook: hook,
        params: {
          challengeId: challengeId,
          playerId: playerId,
        },
      });
      this.logger.debug(`Job ${job.id} added to the queue (hook: ${hook.id})`);
    }

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
  async markAsCompleted(challengeId: string, playerId: string, date: Date): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: State.COMPLETED, endedAt: date });
    const hooks: ActionHook[] = await this.actionHookService.findAll({
      $and: [{ trigger: { $eq: TriggerEvent.CHALLENGE_COMPLETED } }, { sourceId: { $eq: challengeId } }],
    });
    //send CHALLENGE_COMPLETED message to execute attached hooks
    for (const hook of hooks) {
      const job = await this.hooksQueue.add({
        hook: hook,
        params: {
          challengeId: challengeId,
          playerId: playerId,
        },
      });
      this.logger.debug(`Job ${job.id} added to the queue (hook: ${hook.id})`);
    }

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
  async markAsRejected(challengeId: string, playerId: string): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: State.REJECTED });
    const hooks: ActionHook[] = await this.actionHookService.findAll({
      $and: [{ trigger: { $eq: TriggerEvent.CHALLENGE_REJECTED } }, { sourceId: { $eq: challengeId } }],
    });
    //send CHALLENGE_REJECTED message to execute attached hooks
    for (const hook of hooks) {
      const job = await this.hooksQueue.add({
        hook: hook,
        params: {
          challengeId: challengeId,
          playerId: playerId,
        },
      });
      this.logger.debug(`Job ${job.id} added to the queue (hook: ${hook.id})`);
    }

    return result;
  }

  /**
   * Mark a challenge as available by a certain player.
   *
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which the player made it available
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsAvailable(challengeId: string, playerId: string): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: State.AVAILABLE });
    const hooks: ActionHook[] = await this.actionHookService.findAll({
      $and: [{ trigger: { $eq: TriggerEvent.CHALLENGE_AVAILABLE } }, { sourceId: { $eq: challengeId } }],
    });
    //send CHALLENGE_AVAILABLE message to execute attached hooks
    for (const hook of hooks) {
      const job = await this.hooksQueue.add({
        hook: hook,
        params: {
          challengeId: challengeId,
          playerId: playerId,
        },
      });
      this.logger.debug(`Job ${job.id} added to the queue (hook: ${hook.id})`);
    }

    return result;
  }

  /**
   * Mark a challenge as hidden by a certain player.
   *
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which the player made it hidden
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsHidden(challengeId: string, playerId: string): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: State.HIDDEN });
    const hooks: ActionHook[] = await this.actionHookService.findAll({
      $and: [{ trigger: { $eq: TriggerEvent.CHALLENGE_HIDDEN } }, { sourceId: { $eq: challengeId } }],
    });
    //send CHALLENGE_HIDDEN message to execute attached hooks
    for (const hook of hooks) {
      const job = await this.hooksQueue.add({
        hook: hook,
        params: {
          challengeId: challengeId,
          playerId: playerId,
        },
      });
      this.logger.debug(`Job ${job.id} added to the queue (hook: ${hook.id})`);
    }

    return result;
  }

  /**
   * Mark a challenge as locked by a certain player.
   *
   * @param {string} playerId the ID of the player
   * @param {string} challengeId the ID of the challenge
   * @param {Date} date the date at which the player made it locked
   * @returns {ChallengeStatus} the challenge status
   */
  async markAsLocked(challengeId: string, playerId: string): Promise<ChallengeStatus> {
    const temp: ChallengeStatus = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatus = await this.patch(temp.id, { state: State.LOCKED });
    const hooks: ActionHook[] = await this.actionHookService.findAll({
      $and: [{ trigger: { $eq: TriggerEvent.CHALLENGE_LOCKED } }, { sourceId: { $eq: challengeId } }],
    });
    //send CHALLENGE_LOCKED message to execute attached hooks
    for (const hook of hooks) {
      const job = await this.hooksQueue.add({
        hook: hook,
        params: {
          challengeId: challengeId,
          playerId: playerId,
        },
      });
      this.logger.debug(`Job ${job.id} added to the queue (hook: ${hook.id})`);
    }

    return result;
  }
}
