import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

import { IFile } from '../common/interfaces/file.interface';
import { BaseService } from '../common/services/base.service';
import { ChallengeStatusService } from '../challenge-status/challenge-status.service';
import { EvaluationEngineService } from '../evaluation-engine/evaluation-engine.service';
import { EventService } from '../event/event.service';
import { Player } from '../player/models/player.model';
import { PlayerService } from '../player/player.service';
import { Validation, ValidationDocument } from './models/validation.model';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { ValidationRepository } from './repositories/validation.repository';

@Injectable()
export class ValidationService extends BaseService<Validation, ValidationDocument> {
  constructor(
    protected readonly repository: ValidationRepository,
    protected readonly eventService: EventService,
    @Inject(forwardRef(() => EvaluationEngineService))
    protected readonly evaluationEngineService: EvaluationEngineService,
    protected readonly playerService: PlayerService,
    @Inject(forwardRef(() => ChallengeStatusService)) protected readonly challengeStatusService: ChallengeStatusService,
  ) {
    super(new Logger(ValidationService.name), repository);
  }

  async findByUser(gameId: string, userId: string, exerciseId?: string): Promise<Validation[]> {
    const player: Player = await this.playerService.findByGameAndUser(gameId, userId);
    const query: Partial<Record<keyof Validation, any>> = {
      player: player.id,
    };
    if (exerciseId) {
      query.exerciseId = exerciseId;
    }
    return this.findAll(query);
  }

  async validate(
    gameId: string,
    exerciseId: string,
    playerId: string,
    file: IFile,
    inputs: string[],
  ): Promise<Validation> {
    const validation: Validation = await super.create({
      game: gameId,
      player: playerId,
      exerciseId: exerciseId,
    } as Validation);

    // send VALIDATION_RECEIVED event
    await this.eventService.fireEvent(TriggerEvent.VALIDATION_RECEIVED, {
      gameId: gameId,
      playerId: playerId,
      exerciseId: exerciseId,
    });

    await this.evaluationEngineService.validate(gameId, validation.id, file, inputs);

    return validation;
  }
}
