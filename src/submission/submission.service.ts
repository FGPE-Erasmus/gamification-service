import { Injectable, LoggerService } from '@nestjs/common';
import got from 'got';

import { appConfig } from '../app.config';
import { BaseService } from '../common/services/base.service';
import { SubmissionDto } from './dto/submission.dto';
import { ReportInput } from './inputs/report.input';
import { SendSubmissionInput } from './inputs/send-submission.input';
import { Submission } from './models/submission.model';
import { Result } from './models/result.enum';
import { SubmissionRepository } from './repository/submission.repository';
import { PlayerService } from '../player/player.service';
import { PlayerDto } from '../player/dto/player.dto';


@Injectable()
export class SubmissionService extends BaseService<Submission, SendSubmissionInput, ReportInput, SubmissionDto> {

  constructor(
    protected readonly logger: LoggerService,
    protected readonly repository: SubmissionRepository,
    protected readonly playerService: PlayerService
  ) {
    super(logger, repository);
  }

  async findByUser(gameId: string, userId: string, exerciseId?: string): Promise<SubmissionDto[]> {
    const player: PlayerDto = await this.playerService.findByGameAndUser(gameId, userId)
    const query: Partial<Record<keyof Submission, any>> = {
      player: player.id
    };
    if ( exerciseId ) {
      query.exerciseId = exerciseId;
    }
    return this.findAll(query);
  }

  async create(input: SendSubmissionInput): Promise<SubmissionDto> {
    const submission: SubmissionDto = await super.create(input);

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

  async onSubmissionAccepted(submission: Submission): Promise<Submission> {
    submission.result = Result.ACCEPT;
    return await this.submissionRepository.save(submission);
  }

  async onSubmissionRejected(submission: Submission): Promise<Submission> {
    submission.result = Result.WRONG_ANSWER;
    return await this.submissionRepository.save(submission);
  }

  async onSubmissionEvaluated(id: string, data: ReportInput): Promise<Submission> {
    const submission: Submission = this.patch(id, )
    let submission: Submission = await this.getSubmission(data.id.toString());
    submission = { ...submission, ...data };
    return (await data.result) === Result.ACCEPT
      ? this.onSubmissionAccepted(submission)
      : this.onSubmissionRejected(submission);
  }
}
