import { Injectable, Logger } from '@nestjs/common';

import { IFile } from '../common/interfaces/file.interface';
import { BaseService } from '../common/services/base.service';
import { EvaluationEngineService } from '../evaluation-engine/evaluation-engine.service';
import { EventService } from '../event/event.service';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { Player } from '../player/models/player.model';
import { PlayerService } from '../player/player.service';
import { Submission } from './models/submission.model';
import { SubmissionRepository } from './repositories/submission.repository';

@Injectable()
export class SubmissionService extends BaseService<Submission> {
  constructor(
    protected readonly repository: SubmissionRepository,
    protected readonly eventService: EventService,
    protected readonly evaluationEngineService: EvaluationEngineService,
    protected readonly playerService: PlayerService,
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

    await this.eventService.fireEvent(TriggerEvent.SUBMISSION_RECEIVED, {
      gameId: gameId,
      playerId: playerId,
      exerciseId: exerciseId,
    });

    await this.evaluationEngineService.evaluate(submission.id, file);

    return submission;
  }

  /*async onSubmissionReceived(exerciseId: string, playerId: string): Promise<any> {
    const hooks: ActionHook[] = await this.actionHookService.findAll({
      $and: [{ trigger: { $eq: TriggerEventEnum.SUBMISSION_RECEIVED } }, { sourceId: { $eq: exerciseId } }],
    });
    for (const hook of hooks) {
      const job = await this.hooksQueue.add({
        hook: hook,
        params: {
          exerciseId: exerciseId,
          playerId: playerId,
        },
      });
      this.logger.debug(`Job ${job.id} added to the queue (hook: ${hook.id})`);
    }
  }*/

  /*async onSubmissionEvaluated(id: string, data: ReportInput): Promise<Submission> {
    // save result
    const submission: Submission = await this.patch(id, {
      ...data,
    });

    // send notification to trigger further processing
    await this.hooksQueue.add(
      submission.result === Result.ACCEPT ? TriggerEvent.SUBMISSION_ACCEPTED : TriggerEventEnum.SUBMISSION_REJECTED,
      {
        submissionId: submission.id,
        playerId: submission.player,
        exerciseId: submission.exerciseId,
      },
    );

    return submission;
  }*/
}
