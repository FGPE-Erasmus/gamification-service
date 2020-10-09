import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import got from 'got';

import { appConfig } from '../app.config';
import { BaseService } from '../common/services/base.service';
import { TriggerEventEnum, TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { Player } from '../player/models/player.model';
import { PlayerService } from '../player/player.service';
import { ReportInput } from './inputs/report.input';
import { SendSubmissionInput } from './inputs/send-submission.input';
import { Submission } from './models/submission.model';
import { Result } from './models/result.enum';
import { SubmissionRepository } from './repositories/submission.repository';
import { ActionHookService } from '../hook/action-hook.service';
import { ActionHook } from '../hook/models/action-hook.model';

@Injectable()
export class SubmissionService extends BaseService<Submission> {
  constructor(
    protected readonly repository: SubmissionRepository,
    protected readonly playerService: PlayerService,
    @InjectQueue('hooksQueue') protected readonly hooksQueue: Queue,
    protected readonly actionHookService: ActionHookService,
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

  async sendSubmission(input: SendSubmissionInput): Promise<Submission> {
    const submission: Submission = await super.create({
      game: input.game,
      player: input.player,
      exerciseId: input.exerciseId,
    } as Submission);

    // TODO submit student's attempt to Evaluation Engine
    try {
      const response = await got(appConfig.evaluationEngine, {
        json: {
          exerciseId: input.exerciseId,
          file: input.codeFile,
        },
      }).json();
    } catch (e) {
      console.error(e);
    }
    return submission;
  }

  async onSubmissionReceived(exerciseId: string, playerId: string): Promise<any> {
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
  }

  async onSubmissionAccepted(submission: Submission): Promise<Submission> {
    return null;
  }

  async onSubmissionRejected(submission: Submission): Promise<Submission> {
    return null;
  }

  async onSubmissionEvaluated(id: string, data: ReportInput): Promise<Submission> {
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
  }
}
