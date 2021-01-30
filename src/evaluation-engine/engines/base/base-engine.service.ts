import { HttpService, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { EvaluationDto } from '../../../evaluation-engine/dto/evaluation.dto';
import { EvaluationEngine } from '../../../submission/models/evaluation-engine.enum';
import { Result } from '../../../submission/models/result.enum';
import { Submission } from '../../../submission/models/submission.model';

@Injectable()
export class BaseService {
  constructor(protected readonly httpService: HttpService) {}
  results: string[] = ['Accepted', 'Wrong_answer'];

  evaluate(submission: Submission, filename: string, solution: string): EvaluationDto {
    return {
      evaluationEngine: EvaluationEngine.BASE,
      evaluationEngineId: '246810_13579',
    };
  }

  getEvaluationReport(): EvaluationDto {
    const evaluationDto = {
      type: 'evaluation-summary',
      id: '12345678910',
      state: 'final',
      evaluatedAt: Date.now(),
      status: this.results[Math.floor(Math.random() * this.results.length)],
      mark: 10,
    };
    return BaseService.mapBaseEvaluationToEvaluation(evaluationDto);
  }

  private static mapBaseEvaluationToEvaluation(BaseEval: { [key: string]: any }): EvaluationDto {
    return {
      grade: BaseEval.mark,
      result: BaseService.mapBaseResultToResult(BaseEval.status),
      evaluatedAt: new Date(BaseEval.evaluatedAt),
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
      case 'ACCEPTED':
        return Result.ACCEPT;
      case 'WRONG_ANSWER':
        return Result.WRONG_ANSWER;
      default:
        return null;
    }
  }
}
