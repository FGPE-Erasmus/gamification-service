import { Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';

import { appConfig } from '../../../app.config';
import { EvaluationDto } from '../../dto/evaluation.dto';
import {
  FINISH_EVALUATION_JOB,
  REQUEST_EVALUATION_JOB,
  WAIT_EVALUATION_RESULT_JOB,
  WAIT_EVALUATION_RESULT_JOB_ATTEMPTS,
  WAIT_EVALUATION_RESULT_JOB_BACKOFF,
  WAIT_EVALUATION_RESULT_JOB_TIMEOUT,
} from '../../evaluation-engine.constants';
import { EventService } from '../../../event/event.service';
import { TriggerEventEnum as TriggerEvent } from '../../../hook/enums/trigger-event.enum';
import { Submission } from '../../../submission/models/submission.model';
import { SubmissionService } from '../../../submission/submission.service';
import { IRequestEvaluationJobData } from '../../interfaces/request-evaluation-job-data.interface';
import { MooshakService } from './mooshak.service';

@Processor(appConfig.queue.evaluation.name)
export class MooshakConsumer {
  protected readonly logger: Logger = new Logger(MooshakConsumer.name);

  constructor(
    @InjectQueue(appConfig.queue.evaluation.name) protected readonly evaluationQueue: Queue,
    protected readonly mooshakService: MooshakService,
    protected readonly eventService: EventService,
    protected readonly submissionService: SubmissionService,
  ) {}

  @Process(REQUEST_EVALUATION_JOB)
  async onEvaluationRequested(job: Job<unknown>): Promise<void> {
    const { submissionId, filename, content } = job.data as IRequestEvaluationJobData;
    let submission: Submission = await this.submissionService.findById(submissionId);

    // get a token
    const { token } = await this.mooshakService.login(
      submission.game as string,
      appConfig.evaluationEngine.username,
      appConfig.evaluationEngine.password,
    );

    this.logger.error('login ... ' + token);

    // evaluate the attempt
    const result: EvaluationDto = await this.mooshakService.evaluate(submission, filename, content, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.logger.error('evaluate ... ' + JSON.stringify(result));

    if (result.result) {
      await this.evaluationQueue.add(FINISH_EVALUATION_JOB, { submissionId, result });
      return;
    }

    submission = await this.submissionService.patch(submissionId, {
      evaluationEngine: result.evaluationEngine,
      evaluationEngineId: result.evaluationEngineId,
    });

    await this.evaluationQueue.add(
      `MOOSHAK_${WAIT_EVALUATION_RESULT_JOB}`,
      {
        submissionId,
        mooshakId: submission.evaluationEngineId,
      },
      {
        backoff: WAIT_EVALUATION_RESULT_JOB_BACKOFF,
        attempts: WAIT_EVALUATION_RESULT_JOB_ATTEMPTS,
        timeout: WAIT_EVALUATION_RESULT_JOB_TIMEOUT,
      },
    );
  }

  @Process(`MOOSHAK_${WAIT_EVALUATION_RESULT_JOB}`)
  async onWaitEvaluationResult(job: Job<unknown>): Promise<void> {
    const { submissionId } = job.data as { submissionId: string };
    const submission: Submission = await this.submissionService.findById(submissionId);

    // get a token
    const { token } = await this.mooshakService.login(
      submission.game as string,
      appConfig.evaluationEngine.username,
      appConfig.evaluationEngine.password,
    );

    // evaluate the attempt
    const result: EvaluationDto = await this.mooshakService.getEvaluationReport(submission, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (result.result) {
      await this.evaluationQueue.add(FINISH_EVALUATION_JOB, { submissionId, result });
      return;
    }

    throw new Error('Result not yet available');
  }

  @Process(FINISH_EVALUATION_JOB)
  async onEvaluationFinished(job: Job<unknown>): Promise<void> {
    const { submissionId, result } = job.data as { submissionId: string; result: EvaluationDto };

    const submission: Submission = await this.submissionService.patch(submissionId, {
      language: result.language,
      grade: result.grade,
      result: result.result,
      metrics: result.metrics,
      feedback: result.feedback,
      evaluatedAt: result.evaluatedAt,
    });

    await this.eventService.fireEvent(TriggerEvent.SUBMISSION_EVALUATED, {
      submissionId,
      exerciseId: submission.exerciseId,
      playerId: submission.player as string,
    });
  }
}