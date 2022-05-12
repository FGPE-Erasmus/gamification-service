import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { appConfig } from '../app.config';
import { REQUEST_EVALUATION_JOB, REQUEST_VALIDATION_JOB } from './evaluation-engine.constants';
import { ActivityDto } from './dto/activity.dto';
import { MooshakService } from './engines/mooshak/mooshak.service';
import { ProgrammingLanguageDto } from './dto/programming-language.dto';
import { Submission } from '../submission/models/submission.model';
import { SubmissionService } from '../submission/submission.service';
import { ValidationService } from '../submission/validation.service';
import { Validation } from '../submission/models/validation.model';
import { GameService } from '../game/game.service';

@Injectable()
export class EvaluationEngineService {
  protected readonly logger: Logger = new Logger(EvaluationEngineService.name);

  constructor(
    @Inject(forwardRef(() => ValidationService)) protected readonly validationService: ValidationService,
    @Inject(forwardRef(() => SubmissionService)) protected readonly submissionService: SubmissionService,
    @Inject(forwardRef(() => GameService)) protected readonly gameService: GameService,
    protected readonly mooshakService: MooshakService,
    @InjectQueue(appConfig.queue.evaluation.name) protected readonly evaluationQueue: Queue,
  ) {}

  async getProgrammingLanguages(gameId: string): Promise<ProgrammingLanguageDto[]> {
    // get the game
    const game = await this.gameService.findById(gameId);

    // get a token
    const { token } = await this.mooshakService.login(
      game.courseId,
      appConfig.evaluationEngine.username,
      appConfig.evaluationEngine.password,
    );

    // evaluate the attempt
    return await this.mooshakService.getLanguages(game.courseId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getProgrammingLanguage(gameId: string, languageId: string): Promise<ProgrammingLanguageDto> {
    // get the game
    const game = await this.gameService.findById(gameId);

    // get a token
    const { token } = await this.mooshakService.login(
      game.courseId,
      appConfig.evaluationEngine.username,
      appConfig.evaluationEngine.password,
    );

    // evaluate the attempt
    return await this.mooshakService.getLanguage(game.courseId, languageId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getActivities(courseId: string, activityIds: string[]): Promise<ActivityDto[]> {
    // get a token
    const { token } = await this.mooshakService.login(
      courseId,
      appConfig.evaluationEngine.username,
      appConfig.evaluationEngine.password,
    );

    // get the activities
    const activities = [];
    for (const activityId of activityIds) {
      activities.push(
        await this.mooshakService.getActivity(courseId, activityId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
    }
    return activities;
  }

  async getActivity(courseId: string, activityId: string): Promise<ActivityDto> {
    // get the activities
    return (await this.getActivities(courseId, [activityId]))[0];
  }

  async validate(
    gameId: string,
    validationId: string,
    filename: string,
    content: string,
    inputs: string[],
  ): Promise<void> {
    // get the game
    const game = await this.gameService.findById(gameId);

    // validate
    await this.evaluationQueue.add(`${(game.evaluationEngine || 'BASE').toUpperCase()}_${REQUEST_VALIDATION_JOB}`, {
      courseId: game.courseId,
      validationId,
      filename,
      content,
      inputs,
    });
  }

  async evaluate(gameId: string, submissionId: string, filename: string, content: string): Promise<void> {
    // get the game
    const game = await this.gameService.findById(gameId);

    // evaluate
    await this.evaluationQueue.add(`${(game.evaluationEngine || 'BASE').toUpperCase()}_${REQUEST_EVALUATION_JOB}`, {
      courseId: game.courseId,
      submissionId,
      filename,
      content,
    });
  }

  async getValidationProgram(validationId: string): Promise<string> {
    const validation: Validation = await this.validationService.findById(validationId, null, {
      lean: true,
      populate: 'game',
    });

    return validation.program;
  }

  async getSubmissionProgram(submissionId: string): Promise<string> {
    const submission: Submission = await this.submissionService.findById(submissionId, null, {
      lean: true,
      populate: 'game',
    });

    return submission.program;
  }
}
