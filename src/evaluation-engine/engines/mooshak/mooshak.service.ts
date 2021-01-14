import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import * as FormData from 'form-data';
import { ObservableInput, throwError } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';

import { Submission } from '../../../submission/models/submission.model';
import { Result } from '../../../submission/models/result.enum';
import { EvaluationEngine } from '../../../submission/models/evaluation-engine.enum';
import { EvaluationDto } from '../../dto/evaluation.dto';
import { IEngineService } from '../engine-service.interface';
import { MooshakEvaluationDto } from './mooshak-evaluation.dto';
import { MooshakExceptionDto } from './mooshak-exception.dto';
import { MooshakSubmissionDto } from './mooshak-submission.dto';
import { ProgrammingLanguageDto } from '../../dto/programming-language.dto';
import { ActivityDto } from '../../dto/activity.dto';
import { base64Decode } from '../../../common/utils/string.utils';

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

  async getLanguages(gameId: string, options?: AxiosRequestConfig): Promise<ProgrammingLanguageDto[]> {
    return await this.httpService
      .get<ProgrammingLanguageDto[]>(`/data/contests/${'proto_fgpe' || gameId}/languages`, options)
      .pipe(
        first(),
        map<any, ProgrammingLanguageDto[]>(res => res.data),
        MooshakService.catchMooshakError(),
      )
      .toPromise();
  }

  async getLanguage(gameId: string, languageId: string, options?: AxiosRequestConfig): Promise<ProgrammingLanguageDto> {
    return await this.httpService
      .get<ProgrammingLanguageDto>(`/data/contests/${'proto_fgpe' || gameId}/languages/${languageId}`, options)
      .pipe(
        first(),
        map<any, ProgrammingLanguageDto>(res => res.data),
        MooshakService.catchMooshakError(),
      )
      .toPromise();
  }

  async getActivity(gameId: string, activityId: string, options?: AxiosRequestConfig): Promise<ActivityDto> {
    const activity: ActivityDto = await this.httpService
      .get<ActivityDto>(`/data/contests/${'proto_fgpe' || gameId}/problems/${activityId}`, options)
      .pipe(
        first(),
        map<any, ActivityDto>(res => res.data),
        MooshakService.catchMooshakError(),
      )
      .toPromise();

    const viewer: { statement: string; PDFviewable: boolean } = await this.httpService
      .get<{ statement: string; PDFviewable: boolean }>(
        `/data/contests/${'proto_fgpe' || gameId}/problems/${activityId}/view`,
        options,
      )
      .pipe(
        first(),
        map<any, { statement: string; PDFviewable: boolean }>(res => res.data),
        MooshakService.catchMooshakError(),
      )
      .toPromise();

    if (viewer.PDFviewable) {
      const pdf: ArrayBuffer = await this.httpService
        .get<ArrayBuffer>(`/data/contests/${'proto_fgpe' || gameId}/problems/${activityId}/view`, {
          ...options,
          responseType: 'arraybuffer',
        })
        .pipe(
          first(),
          map(res => res.data),
          MooshakService.catchMooshakError(),
        )
        .toPromise();
      activity.statement = String.fromCharCode.apply(null, new Uint16Array(pdf));
      activity.pdf = true;
    } else {
      activity.statement = viewer.statement;
    }

    return activity;
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

    const response: MooshakSubmissionDto = await this.httpService
      .post<MooshakSubmissionDto>(
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
        map<any, MooshakSubmissionDto>(res => res.data),
        MooshakService.catchMooshakError(),
      )
      .toPromise();

    return MooshakService.mapMooshakSubmissionToEvaluation(response);
  }

  async getEvaluationReport(submission: Submission, options: AxiosRequestConfig = {}): Promise<EvaluationDto> {
    const response: MooshakEvaluationDto = await this.httpService
      .get<MooshakEvaluationDto | MooshakExceptionDto>(
        // TODO use 'submission.game' variable below
        `/data/contests/${'proto_fgpe' || submission.game}/submissions/${
          submission.evaluationEngineId
        }/evaluation-summary`,
        options,
      )
      .pipe(
        first(),
        map<any, MooshakEvaluationDto>(res => res.data),
        tap(d => console.log(d)),
        MooshakService.catchMooshakError(),
      )
      .toPromise();

    return MooshakService.mapMooshakEvaluationToEvaluation(response as MooshakEvaluationDto);
  }

  async getEvaluationProgram(submission: Submission, options?: AxiosRequestConfig): Promise<string> {
    return await this.httpService
      .get<string>(
        // TODO use 'submission.game' variable below
        `/data/contests/${'proto_fgpe' || submission.game}/submissions/${submission.evaluationEngineId}/program`,
        options,
      )
      .pipe(
        first(),
        map<any, string>(res => base64Decode(res.data)),
        MooshakService.catchMooshakError(),
      )
      .toPromise();
  }

  private static catchMooshakError = <T>() =>
    catchError<T, ObservableInput<any>>((error: AxiosError) => {
      console.log(error);
      if (error.response) {
        const ex: MooshakExceptionDto = error.response.data as MooshakExceptionDto;
        return throwError(new Error(`${ex.status} ${ex.title} -  ${ex.message}`));
      }
      return throwError(new Error(`${error.code} ${error.name} -  ${error.message}`));
    });

  private static mapMooshakSubmissionToEvaluation(mooshakSubmission: MooshakSubmissionDto): EvaluationDto {
    return {
      result: MooshakService.mapMooshakResultToResult(mooshakSubmission.classify),
      evaluationEngine: EvaluationEngine.MOOSHAK,
      evaluationEngineId: mooshakSubmission.id,
    };
  }

  private static mapMooshakEvaluationToEvaluation(mooshakEval: MooshakEvaluationDto): EvaluationDto {
    return {
      evaluatedAt: new Date(mooshakEval.evaluatedAt),
      language: mooshakEval.language,
      result: MooshakService.mapMooshakResultToResult(mooshakEval.status),
      grade: mooshakEval.mark,
      feedback: ((mooshakEval.observations && mooshakEval.observations + '\n\n') || '') + (mooshakEval.feedback || ''),
      metrics: mooshakEval.metrics,
    };
  }

  private static mapMooshakResultToResult(mooshakResult: string): Result {
    if (!mooshakResult) {
      return null;
    }
    switch (
      mooshakResult
        .toUpperCase()
        .split(' ')
        .join('_')
    ) {
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
