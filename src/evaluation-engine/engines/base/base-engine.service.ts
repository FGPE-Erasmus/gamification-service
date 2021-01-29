import { HttpService, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { first, map } from 'rxjs/operators';
import { EvaluationDto } from 'src/evaluation-engine/dto/evaluation.dto';
import { EvaluationEngine } from 'src/submission/models/evaluation-engine.enum';
import { Result } from 'src/submission/models/result.enum';
import { Submission } from 'src/submission/models/submission.model';
import { BaseSubmissionDto } from './base-submission.dto';
import * as FormData from 'form-data';
import { BaseEvaluationDto } from './base-evaluation.dto';

@Injectable()
export class BaseService {
  constructor(protected readonly httpService: HttpService) {}

  async login(contest: string, username: string, password: string): Promise<{ token: string }> {
    return await this.httpService
      .post<{ token: string }>(`/auth/login`, {
        contest: 'proto_fgpe' || contest,
        username,
        password,
      })
      .pipe(
        first(),
        map(res => res.data),
      )
      .toPromise();
  }

  async evaluate(
    submission: Submission,
    filename: string,
    solution: string,
    options: AxiosRequestConfig = {},
    modeParameters?: string[],
  ): Promise<EvaluationDto> {
    const data: FormData = new FormData();
    data.append('program', Buffer.from(solution, 'utf-8'), filename);
    if (modeParameters) {
      for (let i = 0; i < modeParameters.length; i++) {
        data.append('modeParameters[]', modeParameters[i]);
      }
    }

    const response: BaseSubmissionDto = await this.httpService
      .post<BaseSubmissionDto>(
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
        map<any, BaseSubmissionDto>(res => res.data),
      )
      .toPromise();

    return BaseService.mapBaseSubmissionToEvaluation(response);
  }

  private static mapBaseSubmissionToEvaluation(baseSubmission: BaseSubmissionDto): EvaluationDto {
    return {
      result: BaseService.mapBaseResultToResult(baseSubmission.classify),
      evaluationEngine: EvaluationEngine.BASE,
      evaluationEngineId: baseSubmission.id,
    };
  }

  async getEvaluationReport(submission: Submission, options: AxiosRequestConfig = {}): Promise<EvaluationDto> {
    const response: BaseEvaluationDto = await this.httpService
      .get<BaseEvaluationDto>(
        `/data/contests/${'proto_fgpe' || submission.game}/submissions/${
          submission.evaluationEngineId
        }/evaluation-summary`,
        options,
      )
      .pipe(
        first(),
        map<any, BaseEvaluationDto>(res => res.data),
      )
      .toPromise();

    return BaseService.mapBaseEvaluationToEvaluation(response as BaseEvaluationDto);
  }

  private static mapBaseEvaluationToEvaluation(BaseEval: BaseEvaluationDto): EvaluationDto {
    return {
      evaluatedAt: new Date(BaseEval.evaluatedAt),
      language: BaseEval.language,
      result: BaseService.mapBaseResultToResult(BaseEval.status),
      grade: BaseEval.mark,
      feedback: ((BaseEval.observations && BaseEval.observations + '\n\n') || '') + (BaseEval.feedback || ''),
      metrics: BaseEval.metrics,
    };
  }

  private static mapBaseResultToResult(baseResult: string): Result {
    if (!baseResult) {
      return null;
    }
    switch (
      baseResult
        .toUpperCase()
        .split(' ')
        .join('_')
    ) {
      case 'EVALUATING':
        return Result.PROCESSING;
      case 'ACCEPTED':
        return Result.ACCEPT;
      case 'WRONG_ANSWER':
        return Result.WRONG_ANSWER;
      default:
        return null;
    }
  }
}
