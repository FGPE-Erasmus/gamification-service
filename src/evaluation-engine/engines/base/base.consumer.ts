import { Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';

import { appConfig } from '../../../app.config';
import { Submission } from '../../../submission/models/submission.model';
import { SubmissionService } from '../../../submission/submission.service';
import { EvaluationDto } from '../../dto/evaluation.dto';
import {
  FINISH_EVALUATION_JOB,
  FINISH_VALIDATION_JOB,
  REQUEST_EVALUATION_JOB,
  REQUEST_VALIDATION_JOB,
  WAIT_EVALUATION_RESULT_JOB,
  WAIT_VALIDATION_RESULT_JOB,
} from '../../evaluation-engine.constants';
import { IRequestEvaluationJobData } from '../../interfaces/request-evaluation-job-data.interface';
import { ChallengeService } from '../../../challenge/challenge.service';
import { Mode } from '../../../challenge/models/mode.enum';
import { Challenge } from '../../../challenge/models/challenge.model';
import { BaseService } from './base-engine.service';
import { IRequestValidationJobData } from '../../interfaces/request-validation-job-data.interface';
import { Validation } from '../../../submission/models/validation.model';
import { ValidationService } from '../../../submission/validation.service';

@Processor(appConfig.queue.evaluation.name)
export class BaseConsumer {
  protected readonly logger: Logger = new Logger(BaseConsumer.name);

  constructor(
    @InjectQueue(appConfig.queue.evaluation.name) protected readonly evaluationQueue: Queue,
    protected readonly baseService: BaseService,
    protected readonly submissionService: SubmissionService,
    protected readonly validationService: ValidationService,
    protected readonly challengeService: ChallengeService,
  ) {}

  @Process(`BASE_${REQUEST_EVALUATION_JOB}`)
  async onEvaluationRequested(job: Job<unknown>): Promise<void> {
    const { submissionId, filename, content } = job.data as IRequestEvaluationJobData;
    let submission: Submission = await this.submissionService.findById(submissionId, null, {
      lean: true,
      populate: 'game',
    });
    let modeParameters;

    const challenge: Challenge = await this.challengeService.findOne({
      $and: [{ refs: submission.exerciseId }, { game: submission.game.id }],
    });

    if (challenge && challenge.mode === Mode.HACK_IT) {
      modeParameters = challenge.modeParameters;
    }

    // evaluate the attempt
    const result = await this.baseService.evaluate(submission.game.courseId, submission, filename, content);

    submission = await this.submissionService.patch(submissionId, {
      evaluationEngine: result.evaluationEngine,
      evaluationEngineId: result.evaluationEngineId,
    });

    await this.evaluationQueue.add(`BASE_${WAIT_EVALUATION_RESULT_JOB}`, { submissionId });
  }

  @Process(`BASE_${WAIT_EVALUATION_RESULT_JOB}`)
  async onWaitEvaluationResult(job: Job<unknown>): Promise<void> {
    const { submissionId } = job.data as { submissionId: string };
    const submission: Submission = await this.submissionService.findById(submissionId, null, {
      lean: true,
      populate: 'game',
    });

    const result: EvaluationDto = await this.baseService.getEvaluationReport(submission.game.courseId, submission);

    if (result.result) {
      await this.evaluationQueue.add(`BASE_${FINISH_EVALUATION_JOB}`, { submissionId, result });
      return;
    }

    throw new Error('Result not yet available');
  }

  @Process(`BASE_${FINISH_EVALUATION_JOB}`)
  async onEvaluationFinished(job: Job<unknown>): Promise<void> {
    const { submissionId, result } = job.data as { submissionId: string; result: EvaluationDto };

    const submission: Submission = await this.submissionService.patch(submissionId, {
      grade: result.grade,
      result: result.result,
      evaluatedAt: result.evaluatedAt,
    });

    this.logger.debug('BASE EVALUATION RESULT: ' + submission.result);
  }

  @Process(`BASE_${REQUEST_VALIDATION_JOB}`)
  async onValidationRequested(job: Job<unknown>): Promise<void> {
    const { validationId, filename, content, inputs } = job.data as IRequestValidationJobData;
    let validation: Validation = await this.validationService.findById(validationId, null, {
      lean: true,
      populate: 'game',
    });
    let modeParameters;

    const challenge: Challenge = await this.challengeService.findOne({
      $and: [{ refs: validation.exerciseId }, { game: validation.game.id }],
    });

    if (challenge && challenge.mode === Mode.HACK_IT) {
      modeParameters = challenge.modeParameters;
    }

    // evaluate the attempt
    const result = await this.baseService.validate(validation.game.courseId, validation, filename, content, inputs);

    validation = await this.validationService.patch(validationId, {
      evaluationEngine: result.evaluationEngine,
      evaluationEngineId: result.evaluationEngineId,
    });

    await this.evaluationQueue.add(`BASE_${WAIT_VALIDATION_RESULT_JOB}`, { validationId });
  }

  @Process(`BASE_${WAIT_VALIDATION_RESULT_JOB}`)
  async onWaitValidationResult(job: Job<unknown>): Promise<void> {
    const { validationId } = job.data as { validationId: string };
    const validation: Validation = await this.validationService.findById(validationId, null, {
      lean: true,
      populate: 'game',
    });

    const result: EvaluationDto = await this.baseService.getValidationReport(validation.game.courseId, validation);

    if (result.result) {
      await this.evaluationQueue.add(`BASE_${FINISH_EVALUATION_JOB}`, { validationId, result });
      return;
    }

    throw new Error('Result not yet available');
  }

  @Process(`BASE_${FINISH_VALIDATION_JOB}`)
  async onValidationFinished(job: Job<unknown>): Promise<void> {
    const { validationId, result } = job.data as { validationId: string; result: EvaluationDto };

    const validation: Validation = await this.validationService.patch(validationId, {
      result: result.result,
      evaluatedAt: result.evaluatedAt,
    });
  }
}
