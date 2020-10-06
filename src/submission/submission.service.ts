import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import got from 'got';

import { appConfig } from '../app.config';
import { BaseService } from '../common/services/base.service';
import { PlayerDto } from '../player/dto/player.dto';
import { PlayerService } from '../player/player.service';
import { SubmissionDto } from './dto/submission.dto';
import { ReportInput } from './inputs/report.input';
import { SendSubmissionInput } from './inputs/send-submission.input';
import { Submission } from './models/submission.model';
import { Result } from './models/result.enum';
import { SubmissionRepository } from './repositories/submission.repository';
import { SubmissionInput } from './inputs/submission.input';
import { SubmissionToDtoMapper } from './mappers/submission-to-dto.mapper';
import { SubmissionToPersistenceMapper } from './mappers/submission-to-persistence.mapper';
import { TriggerEventEnum, TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';

@Injectable()
export class SubmissionService extends BaseService<Submission, SubmissionInput, SubmissionDto> {
  constructor(
    protected readonly repository: SubmissionRepository,
    protected readonly toDtoMapper: SubmissionToDtoMapper,
    protected readonly toPersistenceMapper: SubmissionToPersistenceMapper,
    @InjectQueue('hooksQueue') protected readonly hooksQueue: Queue,
    protected readonly playerService: PlayerService,
  ) {
    super(new Logger(SubmissionService.name), repository, toDtoMapper, toPersistenceMapper);
  }

  async findByUser(gameId: string, userId: string, exerciseId?: string): Promise<SubmissionDto[]> {
    const player: PlayerDto = await this.playerService.findByGameAndUser(gameId, userId);
    const query: Partial<Record<keyof Submission, any>> = {
      player: player.id,
    };
    if (exerciseId) {
      query.exerciseId = exerciseId;
    }
    return this.findAll(query);
  }

  async sendSubmission(input: SendSubmissionInput): Promise<SubmissionDto> {
    const submission: SubmissionDto = await super.create({
      game: input.game,
      player: input.player,
      exerciseId: input.exerciseId,
    });

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
    return null;
  }

  async onSubmissionRejected(submission: Submission): Promise<Submission> {
    return null;
  }

  async onSubmissionEvaluated(id: string, data: ReportInput): Promise<SubmissionDto> {
    // save result
    const submission: SubmissionDto = await this.patch(id, {
      ...data,
    });

    // send notification to trigger further processing
    await this.hooksQueue.add(
      submission.result === Result.ACCEPT ? TriggerEvent.SUBMISSION_ACCEPTED : TriggerEventEnum.SUBMISSION_REJECTED,
      {
        submissionId: submission.id,
        playerId: submission.player,
        exerciseId: submission.exerciseId,
      },
    );

    return submission;
  }
}
