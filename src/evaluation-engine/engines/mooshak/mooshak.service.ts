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
import { MooshakSubmissionDto } from './mooshak-submission.dto';
import { ProgrammingLanguageDto } from '../../dto/programming-language.dto';
import { ActivityDto } from '../../dto/activity.dto';
import { base64Decode } from '../../../common/utils/string.utils';
import { Validation } from '../../../submission/models/validation.model';
import { ValidationDto } from '../../dto/validation.dto';
import { MooshakValidationDto } from './mooshak-validation.dto';
import { CodeSkeletonDto } from '../../dto/code-skeleton.dto';
import { CacheService } from '../../../cache/cache.service';

@Injectable()
export class MooshakService implements IEngineService {
  protected readonly logger: Logger = new Logger(MooshakService.name);

  protected static tokenCache: { [_: string]: { token: string; expiryTime: number } } = {};

  constructor(protected readonly cacheService: CacheService, protected readonly httpService: HttpService) {}

  async login(courseId: string, username: string, password: string): Promise<{ token: string }> {
    const now = new Date().getTime();

    if (MooshakService.tokenCache[courseId]) {
      if (MooshakService.tokenCache[courseId].expiryTime > now) {
        return { ...MooshakService.tokenCache[courseId] };
      }
    }

    const { token } = await this.httpService
      .post<{ token: string }>(`/auth/login`, {
        contest: courseId,
        username,
        password,
      })
      .pipe(
        first(),
        map(res => res.data),
        this.catchMooshakError(courseId),
      )
      .toPromise();

    MooshakService.tokenCache[courseId] = {
      token,
      expiryTime: now + 60 * 60 * 1000, // 1 hour
    };

    return { token };
  }

  async getLanguages(courseId: string, options?: AxiosRequestConfig): Promise<ProgrammingLanguageDto[]> {
    return await this.httpService
      .get<ProgrammingLanguageDto[]>(`/data/contests/${courseId}/languages`, options)
      .pipe(
        first(),
        map<any, ProgrammingLanguageDto[]>(res => res.data),
        this.catchMooshakError(courseId),
      )
      .toPromise();
  }

  async getLanguage(
    courseId: string,
    languageId: string,
    options?: AxiosRequestConfig,
  ): Promise<ProgrammingLanguageDto> {
    return await this.httpService
      .get<ProgrammingLanguageDto>(`/data/contests/${courseId}/languages/${languageId}`, options)
      .pipe(
        first(),
        map<any, ProgrammingLanguageDto>(res => res.data),
        this.catchMooshakError(courseId),
      )
      .toPromise();
  }

  async getActivity(courseId: string, activityId: string, options?: AxiosRequestConfig): Promise<ActivityDto> {
    const cacheKey = `activity:${courseId}:${activityId}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const activity: ActivityDto = await this.httpService
      .get<ActivityDto>(`/data/contests/${courseId}/problems/${activityId}`, options)
      .pipe(
        first(),
        map<any, ActivityDto>(res => res.data),
        this.catchMooshakError(courseId),
      )
      .toPromise();

    const codeSkeletons: CodeSkeletonDto[] = await this.httpService
      .get<[any]>(`/data/contests/${courseId}/problems/${activityId}/skeletons`, options)
      .pipe(
        first(),
        map<any, ActivityDto>(res => res.data),
        this.catchMooshakError(courseId),
      )
      .toPromise();

    activity.codeSkeletons = codeSkeletons ? codeSkeletons : [];

    const viewer: { statement: string; pdfviewable: boolean } = await this.httpService
      .get<{ statement: string; pdfviewable: boolean }>(
        `/data/contests/${courseId}/problems/${activityId}/view`,
        options,
      )
      .pipe(
        first(),
        map<any, { statement: string; pdfviewable: boolean }>(res => res.data),
        this.catchMooshakError(courseId),
      )
      .toPromise();

    if (viewer.pdfviewable) {
      const pdf: ArrayBuffer = await this.httpService
        .get<ArrayBuffer>(`/data/contests/${courseId}/problems/${activityId}/pdf-statement`, {
          ...options,
          responseType: 'arraybuffer',
        })
        .pipe(
          first(),
          map(res => res.data),
          this.catchMooshakError(courseId),
        )
        .toPromise();
      activity.statement = Buffer.from(new Uint8Array(pdf)).toString('base64');
      activity.pdf = true;
    } else {
      activity.statement = viewer.statement;
    }

    await this.cacheService.set(cacheKey, activity);

    return activity;
  }

  async validate(
    courseId: string,
    validation: Validation,
    filename: string,
    solution: string,
    inputs: string[],
    options: AxiosRequestConfig = {},
  ): Promise<EvaluationDto> {
    const data: FormData = new FormData();
    data.append('program', Buffer.from(solution, 'utf-8'), filename);
    data.append('consider', 'false');
    for (const input of inputs) {
      data.append('input', input);
    }

    const response: MooshakSubmissionDto = await this.httpService
      .post<MooshakSubmissionDto>(`/data/contests/${courseId}/problems/${validation.exerciseId}/evaluate`, data, {
        ...options,
        headers: {
          ...options.headers,
          ...data.getHeaders(),
        },
      })
      .pipe(
        first(),
        map<any, MooshakSubmissionDto>(res => res.data),
        this.catchMooshakError(courseId),
      )
      .toPromise();

    return MooshakService.mapMooshakSubmissionToEvaluation(response);
  }

  async evaluate(
    courseId: string,
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
      .post<MooshakSubmissionDto>(`/data/contests/${courseId}/problems/${submission.exerciseId}/evaluate`, data, {
        ...options,
        headers: {
          ...options.headers,
          ...data.getHeaders(),
        },
      })
      .pipe(
        first(),
        map<any, MooshakSubmissionDto>(res => res.data),
        this.catchMooshakError(courseId),
      )
      .toPromise();

    return MooshakService.mapMooshakSubmissionToEvaluation(response);
  }

  async getValidationReport(
    courseId: string,
    validation: Validation,
    options: AxiosRequestConfig = {},
  ): Promise<ValidationDto> {
    const response: MooshakValidationDto = await this.httpService
      .get<MooshakValidationDto | MooshakExceptionDto>(
        `/data/contests/${courseId}/validations/${validation.evaluationEngineId}/evaluation-summary`,
        options,
      )
      .pipe(
        first(),
        map<any, MooshakValidationDto>(res => res.data),
        this.catchMooshakError(courseId),
      )
      .toPromise();

    return MooshakService.mapMooshakValidationToValidation(response as MooshakValidationDto);
  }

  async getEvaluationReport(
    courseId: string,
    submission: Submission,
    options: AxiosRequestConfig = {},
  ): Promise<EvaluationDto> {
    const response: MooshakEvaluationDto = await this.httpService
      .get<MooshakEvaluationDto | MooshakExceptionDto>(
        `/data/contests/${courseId}/submissions/${submission.evaluationEngineId}/evaluation-summary`,
        options,
      )
      .pipe(
        first(),
        map<any, MooshakEvaluationDto>(res => res.data),
        this.catchMooshakError(courseId),
      )
      .toPromise();

    return MooshakService.mapMooshakEvaluationToEvaluation(response as MooshakEvaluationDto);
  }

  async getValidationProgram(courseId: string, validation: Validation, options?: AxiosRequestConfig): Promise<string> {
    return await this.httpService
      .get<string>(`/data/contests/${courseId}/validations/${validation.evaluationEngineId}/program`, options)
      .pipe(
        first(),
        map<any, string>(res => base64Decode(res.data)),
        this.catchMooshakError(courseId),
      )
      .toPromise();
  }

  async getEvaluationProgram(courseId: string, submission: Submission, options?: AxiosRequestConfig): Promise<string> {
    return await this.httpService
      .get<string>(`/data/contests/${courseId}/submissions/${submission.evaluationEngineId}/program`, options)
      .pipe(
        first(),
        map<any, string>(res => base64Decode(res.data)),
        this.catchMooshakError(courseId),
      )
      .toPromise();
  }

  // TODO import course

  // TODO import problem

  private catchMooshakError = <T>(courseId?: string) =>
    catchError<T, ObservableInput<any>>((error: AxiosError) => {
      console.log(error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          console.log(MooshakService.tokenCache);
          delete MooshakService.tokenCache[courseId];
          console.log(MooshakService.tokenCache);
        }
        const ex: MooshakExceptionDto = error.response.data as MooshakExceptionDto;
        return throwError(new Error(`${ex.status} ${ex.title} -  ${ex.message}`));
      }
      return throwError(new Error(`${error.code} ${error.name} -  ${error.message}`));
    });

  private static mapMooshakSubmissionToEvaluation(mooshakSubmission: MooshakSubmissionDto): EvaluationDto {
    console.log(mooshakSubmission);
    return {
      result: MooshakService.mapMooshakResultToResult(mooshakSubmission.classify),
      evaluationEngine: EvaluationEngine.MOOSHAK,
      evaluationEngineId: mooshakSubmission.id,
    };
  }

  private static mapMooshakValidationToValidation(mooshakValidationDto: MooshakValidationDto): ValidationDto {
    return {
      evaluatedAt: new Date(mooshakValidationDto.evaluatedAt),
      language: mooshakValidationDto.language,
      result: MooshakService.mapMooshakResultToResult(mooshakValidationDto.status),
      outputs: mooshakValidationDto.outputs,
      userExecutionTimes: mooshakValidationDto.userExecutionTimes,
      feedback:
        ((mooshakValidationDto.observations && mooshakValidationDto.observations + '\n\n') || '') +
        (mooshakValidationDto.feedback || ''),
      metrics: mooshakValidationDto.metrics,
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
      case 'VALIDATED':
      case 'ACCEPTED':
        return Result.ACCEPT;
      case 'PRESENTATION_ERROR':
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
