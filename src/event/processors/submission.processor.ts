import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { appConfig } from '../../app.config';
import { ActionHookService } from '../../hook/action-hook.service';
import { TriggerEventEnum as TriggerEvent } from '../../hook/enums/trigger-event.enum';
import { Result } from '../../submission/models/result.enum';
import { Submission } from '../../submission/models/submission.model';
import { SubmissionService } from '../../submission/submission.service';
import { HookService } from '../../hook/hook.service';
import { EventService } from '../event.service';
import { LeaderboardService } from '../../leaderboard/leaderboard.service';
import { PlayerService } from '../../player/player.service';

@Processor(appConfig.queue.event.name)
export class SubmissionProcessor {
  constructor(
    protected readonly submissionService: SubmissionService,
    protected readonly eventService: EventService,
    protected readonly hookService: HookService,
    protected readonly actionHookService: ActionHookService,
    protected readonly playerService: PlayerService,
    protected readonly leaderboardService: LeaderboardService,
  ) {}

  @Process(`${TriggerEvent.SUBMISSION_RECEIVED}_JOB`)
  async onSubmissionReceived(job: Job<{ gameId: string; exerciseId: string; playerId: string }>): Promise<void> {
    const { gameId, exerciseId, playerId } = job.data;
    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      $and: [
        { game: { $eq: gameId } },
        { trigger: TriggerEvent.SUBMISSION_RECEIVED },
        { $or: [{ sourceId: { $eq: exerciseId } }, { sourceId: { $eq: null } }] },
      ],
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { exerciseId: exerciseId });
    }
  }

  @Process(`${TriggerEvent.SUBMISSION_EVALUATED}_JOB`)
  async onSubmissionEvaluated(
    job: Job<{ gameId: string; submissionId: string; exerciseId: string; playerId: string }>,
  ): Promise<void> {
    const { gameId, submissionId, exerciseId, playerId } = job.data;

    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.SUBMISSION_EVALUATED,
      $or: [{ sourceId: { $eq: null } }, { sourceId: { $eq: exerciseId } }],
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { exerciseId: exerciseId });
    }

    // send notification to trigger further processing
    const submission: Submission = await this.submissionService.findById(submissionId);
    await this.eventService.fireEvent(
      submission.result === Result.ACCEPT ? TriggerEvent.SUBMISSION_ACCEPTED : TriggerEvent.SUBMISSION_REJECTED,
      {
        gameId,
        submissionId,
        playerId,
        exerciseId,
      },
    );

    // invalidate caches
    await this.playerService.invalidateCaches(playerId);
    await this.leaderboardService.invalidateCaches(gameId, playerId);
  }

  @Process(`${TriggerEvent.SUBMISSION_ACCEPTED}_JOB`)
  async onSubmissionAccepted(
    job: Job<{ gameId: string; submissionId: string; exerciseId: string; playerId: string }>,
  ): Promise<void> {
    const { gameId, submissionId, exerciseId, playerId } = job.data;

    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.SUBMISSION_ACCEPTED,
      $or: [{ sourceId: { $eq: null } }, { sourceId: { $eq: exerciseId } }],
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { exerciseId: exerciseId });
    }
  }

  @Process(`${TriggerEvent.SUBMISSION_REJECTED}_JOB`)
  async onSubmissionRejected(
    job: Job<{ gameId: string; submissionId: string; exerciseId: string; playerId: string }>,
  ): Promise<void> {
    const { gameId, submissionId, exerciseId, playerId } = job.data;

    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.SUBMISSION_REJECTED,
      $or: [{ sourceId: { $eq: null } }, { sourceId: { $eq: exerciseId } }],
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { exerciseId: exerciseId });
    }
  }
}
