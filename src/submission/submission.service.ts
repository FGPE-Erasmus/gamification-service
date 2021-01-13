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

@Injectable()
export class SubmissionService extends BaseService<Submission, SubmissionDocument> {
  constructor(
    protected readonly repository: SubmissionRepository,
    protected readonly eventService: EventService,
    @Inject(forwardRef(() => EvaluationEngineService))
    protected readonly evaluationEngineService: EvaluationEngineService,
    protected readonly playerService: PlayerService,
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

  async sendSubmission(gameId: string, exerciseId: string, playerId: string, file: IFile): Promise<Submission> {
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

    await this.evaluationEngineService.evaluate(submission.id, file);

    return submission;
  }
}
