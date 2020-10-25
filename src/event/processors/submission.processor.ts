import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { appConfig } from '../../app.config';
import { EventService } from '../event.service';
import { ActionHookService } from '../../hook/action-hook.service';
import { TriggerEventEnum as TriggerEvent } from '../../hook/enums/trigger-event.enum';
import { Result } from '../../submission/models/result.enum';
import { Submission } from '../../submission/models/submission.model';
import { SubmissionService } from '../../submission/submission.service';
import { HookService } from 'src/hook/hook.service';

@Processor(appConfig.queue.event.name)
export class SubmissionProcessor {
  constructor(
    protected readonly submissionService: SubmissionService,
    protected readonly eventService: EventService,
    protected readonly actionHookService: ActionHookService,
    protected readonly hookService: HookService,
  ) {}

  @Process(`${TriggerEvent.SUBMISSION_RECEIVED}_JOB`)
  async onSubmissionReceived(job: Job<{ exerciseId: string; playerId: string }>): Promise<void> {
    const { exerciseId, playerId } = job.data;

    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      trigger: TriggerEvent.SUBMISSION_RECEIVED,
      sourceId: exerciseId,
    });

    for (const actionHook of actionHooks) {
      this.hookService.executeHook(actionHook, { exerciseId: exerciseId }, job.data);
    }
  }

  @Process(`${TriggerEvent.SUBMISSION_EVALUATED}_JOB`)
  async onSubmissionEvaluated(job: Job<{ submissionId: string; exerciseId: string; playerId: string }>): Promise<void> {
    const { submissionId, exerciseId, playerId } = job.data;

    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      trigger: TriggerEvent.SUBMISSION_EVALUATED,
      $or: [{ sourceId: { $exists: false } }, { sourceId: { $eq: exerciseId } }],
    });

    for (const actionHook of actionHooks) {
      this.hookService.executeHook(actionHook, { exerciseId: exerciseId }, job.data);
    }

    // send notification to trigger further processing
    const submission: Submission = await this.submissionService.findById(submissionId);
    await this.eventService.fireEvent(
      submission.result === Result.ACCEPT ? TriggerEvent.SUBMISSION_ACCEPTED : TriggerEvent.SUBMISSION_REJECTED,
      {
        submissionId,
        playerId,
        exerciseId,
      },
    );
  }

  @Process(`${TriggerEvent.SUBMISSION_ACCEPTED}_JOB`)
  async onSubmissionAccepted(job: Job<{ submissionId: string; exerciseId: string; playerId: string }>): Promise<void> {
    const { submissionId, exerciseId, playerId } = job.data;

    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      trigger: TriggerEvent.SUBMISSION_ACCEPTED,
      sourceId: exerciseId,
    });

    for (const actionHook of actionHooks) {
      this.hookService.executeHook(actionHook, { exerciseId: exerciseId }, job.data);
    }
  }

  @Process(`${TriggerEvent.SUBMISSION_REJECTED}_JOB`)
  async onSubmissionRejected(job: Job<{ submissionId: string; exerciseId: string; playerId: string }>): Promise<void> {
    const { submissionId, exerciseId, playerId } = job.data;

    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      trigger: TriggerEvent.SUBMISSION_REJECTED,
      sourceId: exerciseId,
    });

    for (const actionHook of actionHooks) {
      this.hookService.executeHook(actionHook, { exerciseId: exerciseId }, job.data);
    }
  }
}
