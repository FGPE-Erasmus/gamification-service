import { Injectable } from '@nestjs/common';
import { SubmissionDto } from './dto/submission.dto';
import { SubmissionEntity as Submission } from './entities/submission.entity';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { SubmissionRepository } from './submission.repository';
import { Result } from './entities/result.enum';
import { EvaluationEvent } from './dto/evaluation-event.dto';
import { response } from 'express';
import { appConfig } from 'src/app.config';

import got from 'got';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    private readonly submissionRepository: SubmissionRepository,
  ) {}

  async saveSubmission(id: string | undefined, data: SubmissionDto): Promise<Submission> {
    const fields: { [k: string]: any } = { ...data, submittedAt: new Date() };
    const newSubmission = await this.serviceHelper.getUpsertData(id, fields, this.submissionRepository);
    return await this.submissionRepository.save(newSubmission);
  }

  async getAllSubmissions(exerciseId: string, playerId: string): Promise<Submission[]> {
    return await this.submissionRepository.find({
      where: {
        exerciseId: exerciseId,
        playerId: playerId,
      },
    });
  }

  async getSubmission(submissionId: string): Promise<Submission> {
    const submission = await this.submissionRepository.findOne(submissionId);
    return submission;
  }

  async sendSubmission(submission: SubmissionDto, codeFile: string): Promise<any> {
    // I know that in doc we have parameters (exerciseid, playerId, submission), but two first ones are suppossed to be
    // included in the submission object itself so I thought I would skip it, lemme know if I'm missing a point there
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
