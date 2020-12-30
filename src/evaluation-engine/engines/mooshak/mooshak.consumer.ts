import { Logger, Inject } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { PubSub } from 'graphql-subscriptions';

import { appConfig } from '../../../app.config';
import { NotificationEnum } from '../../../common/enums/notifications.enum';
import { EventService } from '../../../event/event.service';
import { TriggerEventEnum as TriggerEvent } from '../../../hook/enums/trigger-event.enum';
import { Submission } from '../../../submission/models/submission.model';
import { Result } from '../../../submission/models/result.enum';
import { SubmissionService } from '../../../submission/submission.service';
import { SubmissionToDtoMapper } from '../../../submission/mappers/submission-to-dto.mapper';
import { EvaluationDto } from '../../dto/evaluation.dto';
import {
  FINISH_EVALUATION_JOB,
  REQUEST_EVALUATION_JOB,
  WAIT_EVALUATION_RESULT_JOB,
  WAIT_EVALUATION_RESULT_JOB_ATTEMPTS,
  WAIT_EVALUATION_RESULT_JOB_BACKOFF,
  WAIT_EVALUATION_RESULT_JOB_TIMEOUT,
} from '../../evaluation-engine.constants';
import { IRequestEvaluationJobData } from '../../interfaces/request-evaluation-job-data.interface';
import { MooshakService } from './mooshak.service';
import { ChallengeService } from 'src/challenge/challenge.service';
import { Mode } from 'src/challenge/models/mode.enum';
import { AxiosRequestConfig } from 'axios';

@Processor(appConfig.queue.evaluation.name)
export class MooshakConsumer {
  protected readonly logger: Logger = new Logger(MooshakConsumer.name);

  constructor(
    @InjectQueue(appConfig.queue.evaluation.name) protected readonly evaluationQueue: Queue,
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly mooshakService: MooshakService,
    protected readonly eventService: EventService,
    protected readonly submissionService: SubmissionService,
    protected readonly challengeService: ChallengeService,
    protected readonly submissionToDtoMapper: SubmissionToDtoMapper,
  ) {}

  @Process(REQUEST_EVALUATION_JOB)
  async onEvaluationRequested(job: Job<unknown>): Promise<void> {
    const { submissionId, filename, content } = job.data as IRequestEvaluationJobData;
    let submission: Submission = await this.submissionService.findById(submissionId);
    let modeParameters;
    const challenge = await this.challengeService.findOne({
      $and: [{ refs: { $elemMatch: { $eq: submission.exerciseId } } }, { gameId: { $eq: submission.game } }],
    });

    // get a token
    const { token } = await this.mooshakService.login(
      submission.game as string,
      appConfig.evaluationEngine.username,
      appConfig.evaluationEngine.password,
    );

    console.log(token);

    if (challenge.mode === Mode.HACK_IT) {
      modeParameters = challenge.modeParameters;
    }

    // evaluate the attempt
    const result = await this.mooshakService.evaluate(
      submission,
      filename,
      content,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      modeParameters,
    );

    console.log(result);

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

    console.log(result);
    if (result.result !== Result.PROCESSING) {
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

    await this.pubSub.publish(NotificationEnum.SUBMISSION_EVALUATED, {
      submissionEvaluated: this.submissionToDtoMapper.transform(submission),
    });

    await this.eventService.fireEvent(TriggerEvent.SUBMISSION_EVALUATED, {
      gameId: submission.game,
      submissionId,
      exerciseId: submission.exerciseId,
      playerId: submission.player as string,
    });
  }
}
