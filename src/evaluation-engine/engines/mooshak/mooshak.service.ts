import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import * as FormData from 'form-data';
import { ObservableInput, throwError } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';

import { Submission } from '../../../submission/models/submission.model';
import { Result } from '../../../submission/models/result.enum';
import { EvaluationEngine } from '../../../submission/models/evaluation-engine.enum';
import { EvaluationDto } from '../../dto/evaluation.dto';
import { IEngineService } from '../engine-service.interface';
import { MooshakEvaluationDto } from './mooshak-evaluation.dto';
import { MooshakExceptionDto } from './mooshak-exception.dto';

@Injectable()
export class MooshakService implements IEngineService {
  protected readonly logger: Logger = new Logger(MooshakService.name);
  protected readonly token: string;

  constructor(protected readonly httpService: HttpService) {}

  async login(contest: string, username: string, password: string): Promise<{ token: string }> {
    return await this.httpService
      .post<{ token: string }>(`/auth/login`, {
        contest: 'proto_fgpe' || contest, // TODO use 'contest' variable here
        username,
        password,
      })
      .pipe(
        first(),
        map(res => res.data),
        MooshakService.catchMooshakError(),
      )
      .toPromise();
  }

  async evaluate(
    submission: Submission,
    filename: string,
    solution: string,
    options: AxiosRequestConfig = {},
  ): Promise<EvaluationDto> {
    const data: FormData = new FormData();
    data.append('program', Buffer.from(solution, 'utf-8'), filename);

    this.logger.debug(filename);
    this.logger.debug(solution);

    const response: { id: string } | MooshakEvaluationDto = await this.httpService
      .post<{ id: string } | MooshakEvaluationDto>(
        // TODO use 'submission.game' variable below
        `/data/contests/${'proto_fgpe' || submission.game}/problems/${submission.exerciseId}/evaluate`,
        data,
        {
          ...options,
          headers: {
            ...options.headers,
            ...data.getHeaders(),
          },
        },
      )
      .pipe(
        first(),
        map<any, { id: string } | MooshakEvaluationDto>(res => res.data),
        MooshakService.catchMooshakError(),
      )
      .toPromise();

    const result: MooshakEvaluationDto = response as MooshakEvaluationDto;
    if (result.type === 'evaluation-summary') {
      return MooshakService.mapMooshakEvaluationToEvaluation(result);
    }
    return {
      evaluationEngine: EvaluationEngine.MOOSHAK,
      evaluationEngineId: response.id,
    };
  }

  async getEvaluationReport(submission: Submission, options: AxiosRequestConfig = {}): Promise<EvaluationDto> {
    const response: MooshakEvaluationDto = await this.httpService
      .get<MooshakEvaluationDto | MooshakExceptionDto>(
        // TODO use 'submission.game' variable below
        `/data/contests/${'proto_fgpe' || submission.game}/submissions/${submission.id}/evaluation-summary`,
        options,
      )
      .pipe(
        first(),
        map<any, MooshakEvaluationDto>(res => res.data),
        MooshakService.catchMooshakError(),
      )
      .toPromise();

    const dto: MooshakEvaluationDto = response as MooshakEvaluationDto;
    return MooshakService.mapMooshakEvaluationToEvaluation(dto);
  }

  private static catchMooshakError = <T>() =>
    catchError<T, ObservableInput<any>>((error: AxiosError) => {
      if (error.response) {
        const ex: MooshakExceptionDto = error.response.data as MooshakExceptionDto;
        return throwError(new Error(`${ex.status} ${ex.title} -  ${ex.message}`));
      }
      return throwError(new Error(`${error.code} ${error.name} -  ${error.message}`));
    });

  private static mapMooshakEvaluationToEvaluation(mooshakEval: MooshakEvaluationDto): EvaluationDto {
    return {
      language: mooshakEval.language,
      result: MooshakService.mapMooshakResultToResult(mooshakEval.status),
      grade: mooshakEval.mark,
      feedback: mooshakEval.observations + '\n\n' + mooshakEval.feedback,
      metrics: mooshakEval.metrics,
      evaluationEngine: EvaluationEngine.MOOSHAK,
      evaluationEngineId: mooshakEval.id,
    };
  }

  private static mapMooshakResultToResult(mooshakResult: string): Result {
    if (!mooshakResult) {
      return null;
    }
    switch (mooshakResult.toUpperCase().replace(' ', '_')) {
      case 'EVALUATING':
        return Result.PROCESSING;
      case 'ACCEPTED':
      case 'PRESENTATION_ERROR':
        return Result.ACCEPT;
      case 'WRONG_ANSWER':
        return Result.WRONG_ANSWER;
      case 'INVALID_SUBMISSION':
      case 'COMPILE_TIME_ERROR':
        return Result.COMPILATION_ERROR;
      case 'RUNTIME_ERROR':
      case 'INVALID_EXIT_VALUE':
      case 'INVALID_FUNCTION':
        return Result.RUNTIME_ERROR;
      case 'OUTPUT_LIMIT_EXCEEDED':
        return Result.OUTPUT_LIMIT_OVERFLOW;
      case 'TIME_LIMIT_EXCEEDED':
        return Result.TIMEOUT;
      case 'MEMORY_LIMIT_EXCEEDED':
      case 'PROGRAM_SIZE_EXCEEDED':
        return Result.RESOURCE_USAGE_EXCEEDED;
      case 'REQUIRES_REEVALUATION':
        return Result.ASK_FOR_REEVALUATION;
      default:
        return null;
    }
  }
}
