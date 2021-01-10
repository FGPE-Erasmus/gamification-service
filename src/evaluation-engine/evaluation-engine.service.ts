import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { appConfig } from '../app.config';
import { IFile } from '../common/interfaces/file.interface';
import { streamToString } from '../common/utils/stream.utils';
import { REQUEST_EVALUATION_JOB } from './evaluation-engine.constants';
import { ActivityDto } from './dto/activity.dto';
import { MooshakService } from './engines/mooshak/mooshak.service';
import { ProgrammingLanguageDto } from './dto/programming-language.dto';
import { Submission } from '../submission/models/submission.model';
import { SubmissionService } from '../submission/submission.service';

@Injectable()
export class EvaluationEngineService {
  protected readonly logger: Logger = new Logger(EvaluationEngineService.name);

  constructor(
    @Inject(forwardRef(() => SubmissionService)) protected readonly submissionService: SubmissionService,
    protected readonly mooshakService: MooshakService,
    @InjectQueue(appConfig.queue.evaluation.name) protected readonly evaluationQueue: Queue,
  ) {}

  async getProgrammingLanguages(gameId: string): Promise<ProgrammingLanguageDto[]> {
    // get a token
    const { token } = await this.mooshakService.login(
      'proto_fgpe' || gameId,
      appConfig.evaluationEngine.username,
      appConfig.evaluationEngine.password,
    );

    // evaluate the attempt
    return await this.mooshakService.getLanguages(gameId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getProgrammingLanguage(gameId: string, languageId: string): Promise<ProgrammingLanguageDto> {
    // get a token
    const { token } = await this.mooshakService.login(
      'proto_fgpe' || gameId,
      appConfig.evaluationEngine.username,
      appConfig.evaluationEngine.password,
    );

    // evaluate the attempt
    return await this.mooshakService.getLanguage(gameId, languageId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getActivities(gameId: string, activityIds: string[]): Promise<ActivityDto[]> {
    // get a token
    const { token } = await this.mooshakService.login(
      'proto_fgpe' || gameId,
      appConfig.evaluationEngine.username,
      appConfig.evaluationEngine.password,
    );

    // get the activities
    const activities = [];
    for (const activityId of activityIds) {
      activities.push(
        await this.mooshakService.getActivity(gameId, activityId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
    }
    return activities;
  }

  async getActivity(gameId: string, activityId: string): Promise<ActivityDto> {
    return (await this.getActivities(gameId, [activityId]))[0];
  }

  async evaluate(submissionId: string, file: IFile): Promise<void> {
    const content: string = await streamToString(file.content);
    await this.evaluationQueue.add(REQUEST_EVALUATION_JOB, {
      submissionId,
      filename: file.filename,
      content,
    });
  }

  async getSubmissionProgram(submissionId: string): Promise<string> {
    const submission: Submission = await this.submissionService.findById(submissionId);

    // get a token
    const { token } = await this.mooshakService.login(
      'proto_fgpe' || submission.game,
      appConfig.evaluationEngine.username,
      appConfig.evaluationEngine.password,
    );

    // get the program
    return await this.mooshakService.getEvaluationProgram(submission, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
