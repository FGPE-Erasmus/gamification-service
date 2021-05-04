import { HttpService, Injectable } from '@nestjs/common';
import { EvaluationDto } from '../../dto/evaluation.dto';
import { EvaluationEngine } from '../../../submission/models/evaluation-engine.enum';
import { Result } from '../../../submission/models/result.enum';
import { Submission } from '../../../submission/models/submission.model';
import { IEngineService } from '../engine-service.interface';
import { AxiosRequestConfig } from 'axios';
import { Validation } from '../../../submission/models/validation.model';
import { ActivityDto } from '../../dto/activity.dto';
import { ProgrammingLanguageDto } from '../../dto/programming-language.dto';

const POSSIBLE_RESULTS: Result[] = [Result.ACCEPT, Result.WRONG_ANSWER];

@Injectable()
export class BaseService implements IEngineService {
  constructor(protected readonly httpService: HttpService) {}

  async getActivity(courseId: string, activityId: string, options?: AxiosRequestConfig): Promise<ActivityDto> {
    return {
      id: 'H',
      name: 'hello',
      title: 'Hello',
      type: 'BLANK_SHEET',
      pdf: false,
      difficulty: 'HARD',
      statement: '<h2>Hello World</h2><p>Print "Hello World!".</p>',
      codeSkeletons: [],
      color: '#000000',
      timeout: 2,
    };
  }

  async getLanguage(
    courseId: string,
    languageId: string,
    options?: AxiosRequestConfig,
  ): Promise<ProgrammingLanguageDto> {
    return undefined;
  }

  async getLanguages(courseId: string, options?: AxiosRequestConfig): Promise<ProgrammingLanguageDto[]> {
    return [];
  }

  async evaluate(
    courseId: string,
    submission: Submission,
    filename: string,
    code: string,
    options?: AxiosRequestConfig,
  ): Promise<EvaluationDto> {
    return {
      evaluationEngine: EvaluationEngine.BASE,
      evaluationEngineId: '000000000000',
    };
  }

  async getEvaluationReport(
    courseId: string,
    submission: Submission,
    options?: AxiosRequestConfig,
  ): Promise<EvaluationDto> {
    const result: Result = POSSIBLE_RESULTS[Math.floor(Math.random() * POSSIBLE_RESULTS.length)];
    return {
      grade: result === Result.ACCEPT ? 100 : 0,
      result,
      evaluatedAt: new Date(),
    };
  }

  async getEvaluationProgram(courseId: string, submission: Submission, options?: AxiosRequestConfig): Promise<string> {
    return 'print("Hello world!")';
  }

  async validate(
    courseId: string,
    validation: Validation,
    filename: string,
    code: string,
    inputs: string[],
    options?: AxiosRequestConfig,
  ): Promise<EvaluationDto> {
    return {
      evaluationEngine: EvaluationEngine.BASE,
      evaluationEngineId: '100000000000',
    };
  }

  async getValidationReport(
    courseId: string,
    validation: Validation,
    options?: AxiosRequestConfig,
  ): Promise<EvaluationDto> {
    return {
      result: Result.ACCEPT,
      evaluatedAt: new Date(),
    };
  }

  async getValidationProgram(courseId: string, validation: Validation, options?: AxiosRequestConfig): Promise<string> {
    return 'print("Hello world")';
  }
}
