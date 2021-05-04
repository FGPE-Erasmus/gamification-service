import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

import { IFile } from '../common/interfaces/file.interface';
import { BaseService } from '../common/services/base.service';
import { ChallengeStatusService } from '../challenge-status/challenge-status.service';
import { EvaluationEngineService } from '../evaluation-engine/evaluation-engine.service';
import { EventService } from '../event/event.service';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { Player } from '../player/models/player.model';
import { PlayerService } from '../player/player.service';
import { Submission, SubmissionDocument } from './models/submission.model';
import { SubmissionRepository } from './repositories/submission.repository';
import { ChallengeService } from '../challenge/challenge.service';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { Mode } from '../challenge/models/mode.enum';
import { GameService } from '../game/game.service';
import { GameStateEnum } from '../game/enum/game-state.enum';
import { Game } from '../game/models/game.model';

@Injectable()
export class SubmissionService extends BaseService<Submission, SubmissionDocument> {
  constructor(
    protected readonly repository: SubmissionRepository,
    protected readonly eventService: EventService,
    @Inject(forwardRef(() => PlayerService)) protected readonly playerService: PlayerService,
    @Inject(forwardRef(() => GameService)) protected readonly gameService: GameService,
    @Inject(forwardRef(() => EvaluationEngineService))
    protected readonly evaluationEngineService: EvaluationEngineService,
    @Inject(forwardRef(() => ChallengeService)) protected readonly challengeService: ChallengeService,
    @Inject(forwardRef(() => ChallengeStatusService)) protected readonly challengeStatusService: ChallengeStatusService,
  ) {
    super(new Logger(SubmissionService.name), repository);
  }

  async findByUser(gameId: string, userId: string, exerciseId?: string): Promise<Submission[]> {
    const player: Player = await this.playerService.findByGameAndUser(gameId, userId);
    const query: Partial<Record<keyof Submission, any>> = {
      player: player.id,
    };
    if (exerciseId) {
      query.exerciseId = exerciseId;
    }
    return this.findAll(query);
  }

  async evaluate(gameId: string, exerciseId: string, playerId: string, file: IFile): Promise<Submission> {
    const game: Game = await this.gameService.findById(gameId);
    if (game.state === GameStateEnum.LOCKED || game.state === GameStateEnum.CLOSED)
      throw new Error('Submission sent for an unavailable game.');

    const challenge: ChallengeDto = await this.challengeService.findOne({
      game: gameId,
      refs: exerciseId,
    });

    if (challenge.mode === Mode.SHAPESHIFTER)
      exerciseId = await this.challengeStatusService.getCurrentShape(challenge, playerId);

    const submission: Submission = await super.create({
      game: gameId,
      player: playerId,
      exerciseId: exerciseId,
    } as Submission);

    // send SUBMISSION_RECEIVED event
    await this.eventService.fireEvent(TriggerEvent.SUBMISSION_RECEIVED, {
      gameId: gameId,
      playerId: playerId,
      exerciseId: exerciseId,
    });

    await this.evaluationEngineService.evaluate(gameId, submission.id, file);

    return submission;
  }
}
