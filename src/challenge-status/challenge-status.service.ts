import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, LoggerService } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseService } from '../common/services/base.service';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { ChallengeStatusDto } from './dto/challenge-status.dto';
import { ChallengeStatusInput } from './inputs/challenge-status.input';
import { ChallengeStatus } from './models/challenge-status.model';
import { State } from './models/state.enum';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';
import { ChallengeStatusToDtoMapper } from './mappers/challenge-status-to-dto.mapper';
import { ChallengeStatusToPersistenceMapper } from './mappers/challenge-status-to-persistence.mapper';

@Injectable()
export class ChallengeStatusService extends BaseService<ChallengeStatus, ChallengeStatusInput, ChallengeStatusDto> {

  constructor(
    protected readonly logger: LoggerService,
    protected readonly repository: ChallengeStatusRepository,
    protected readonly toDtoMapper: ChallengeStatusToDtoMapper,
    protected readonly toPersistenceMapper: ChallengeStatusToPersistenceMapper,
    @InjectQueue('hooksQueue') protected hooksQueue: Queue,
  ) {
    super(logger, repository, toDtoMapper, toPersistenceMapper);
  }

  /**
   * Find the status of a challenge by challenge ID and player ID.
   *
   * @param challengeId the ID of the challenge
   * @param playerId the ID of the player
   */
  async findByChallengeIdAndPlayerId(challengeId: string, playerId: string): Promise<ChallengeStatusDto> {
    return this.findOne({
      challenge: challengeId,
      player: playerId,
    });
  }

  async markAsOpen(playerId: string, challengeId: string, date: Date): Promise<ChallengeStatusDto> {
    const temp: ChallengeStatusDto = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    return this.patch(temp.id, { state: State.OPENED, openedAt: date });
  }

  async markAsFailed(playerId: string, challengeId: string, date: Date): Promise<ChallengeStatusDto> {
    const temp: ChallengeStatusDto = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatusDto = await this.patch(temp.id, { state: State.FAILED, endedAt: date });

    // send CHALLENGE_FAILED message to execute attached hooks
    await this.hooksQueue.add(TriggerEvent.CHALLENGE_FAILED, {
      challengeId: challengeId,
      playerId: playerId,
    });

    return result;
  }

  async markAsCompleted(playerId: string, challengeId: string, date: Date): Promise<ChallengeStatusDto> {
    const temp: ChallengeStatusDto = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatusDto = await this.patch(temp.id, { state: State.COMPLETED, endedAt: date });

    // send CHALLENGE_COMPLETED message to execute attached hooks
    await this.hooksQueue.add(TriggerEvent.CHALLENGE_COMPLETED, {
      challengeId: challengeId,
      playerId: playerId,
    });

    return result;
  }

  async markAsRejected(playerId: string, challengeId: string, date: Date): Promise<ChallengeStatusDto> {
    const temp: ChallengeStatusDto = await this.findByChallengeIdAndPlayerId(challengeId, playerId);
    const result: ChallengeStatusDto = await this.patch(temp.id, { state: State.REJECTED, endedAt: date });

    // send CHALLENGE_REJECTED message to execute attached hooks
    await this.hooksQueue.add(TriggerEvent.CHALLENGE_REJECTED, {
      challengeId: challengeId,
      playerId: playerId,
    });

    return result;
  }

  toDto(doc: ChallengeStatus): ChallengeStatusDto {
    return plainToClass(ChallengeStatusDto, classToPlain(doc, { excludeExtraneousValues: true }));
  }

  toPersistence(input: ChallengeStatusInput): ChallengeStatus {
    return plainToClass(ChallengeStatus, classToPlain(input, { excludeExtraneousValues: true }));
  }
}
