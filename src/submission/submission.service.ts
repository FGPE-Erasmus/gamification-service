import { Injectable } from '@nestjs/common';
import got from 'got';
import { response } from 'express';

import { SubmissionDto } from './dto/submission.dto';
import { SubmissionEntity as Submission } from './entities/submission.entity';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { SubmissionRepository } from './repository/submission.repository';
import { Result } from './entities/result.enum';
import { EvaluationEvent } from './dto/evaluation-event.dto';
import { appConfig } from 'src/app.config';
import { ActionHookEntity as ActionHook } from 'src/hook/entities/action-hook.entity';
import { ActionHookRepository } from 'src/hook/repository/action-hook.repository';
import { TriggerEventEnum } from 'src/hook/enum/trigger-event.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectQueue('hooksQueue') private hooksQueue: Queue,
    private readonly serviceHelper: ServiceHelper,
    private readonly submissionRepository: SubmissionRepository,
    private readonly actionHookRepository: ActionHookRepository,
  ) {}

  async saveSubmission(id: string | undefined, data: SubmissionDto): Promise<Submission> {
    const fields: { [k: string]: any } = { ...data, submittedAt: new Date() };
    const newSubmission = await this.serviceHelper.getUpsertData(id, fields, this.submissionRepository);
    return await this.submissionRepository.save(newSubmission);
  }

  async getPlayerSubmissions(exerciseId: string, playerId: string): Promise<Submission[]> {
    return await this.submissionRepository.find({
      where: {
        exerciseId: exerciseId,
        playerId: playerId,
      },
    });
  }

  async getAllSubmissions(gameId: string): Promise<Submission[]> {
    return await this.submissionRepository.find({
      where: {
        gameId: gameId,
      },
    });
  }

  async getSubmission(submissionId: string): Promise<Submission> {
    const submission = await this.submissionRepository.findOne(submissionId);
    return submission;
  }

  async sendSubmission(submission: SubmissionDto): Promise<any> {
    // I know that in doc we have parameters (exerciseid, playerId, submission), but two first ones are suppossed to be
    // included in the submission object itself so I thought I would skip it, lemme know if I'm missing a point there
    const codeFile = submission.codeFile;
    delete submission.codeFile;
    this.saveSubmission(submission.id, submission);
    try {
      const response = await got(appConfig.evaluationEngine, {
        json: {
          exerciseId: submission.exerciseId,
          file: codeFile,
        },
      }).json();
    } catch (e) {
      console.error(e);
    }
    // also let me know if I should take care of something more when we send a GET like headers, options etc.
    // or if we need to do smth more with the response than just returning it
    return response;
  }

  async onSubmissionReceived(exerciseId: string, playerId: string): Promise<any> {
    const hooks: ActionHook[] = await this.actionHookRepository.find({
      where: {
        trigger: TriggerEventEnum.SUBMISSION_RECEIVED,
        sourceId: exerciseId,
      },
    });
    hooks.forEach(async hook => {
      const job = await this.hooksQueue.add({
        hook: hook,
        params: {
          exerciseId: exerciseId,
          playerId: playerId,
          exercise: { obj: 'example exerciseObj' },
        },
      });
    });
  }

  async onSubmissionAccepted(submission: Submission): Promise<Submission> {
    submission.result = Result.ACCEPTED;
    return await this.submissionRepository.save(submission);
  }

  async onSubmissionRejected(submission: Submission): Promise<Submission> {
    submission.result = Result.REJECTED;
    return await this.submissionRepository.save(submission);
  }

  async onSubmissionEvaluated(data: EvaluationEvent): Promise<Submission> {
    let submission: Submission = await this.getSubmission(data.id.toString());
    submission = { ...submission, ...data };
    return (await data.result) === Result.ACCEPTED
      ? this.onSubmissionAccepted(submission)
      : this.onSubmissionRejected(submission);
  }
}
