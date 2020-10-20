import { Submission } from '../../submission/models/submission.model';
import { EvaluationDto } from '../dto/evaluation.dto';
import { AxiosRequestConfig } from 'axios';

export interface IEngineService {
  /**
   * Evaluate an attempt submission + file.
   *
   * @param {Submission} submission the received submission.
   * @param {string} filename the name of the file.
   * @param {string} code the file content.
   * @param {AxiosRequestConfig} options for the request
   */
  evaluate(
    submission: Submission,
    filename: string,
    code: string,
    options?: AxiosRequestConfig,
  ): Promise<{ submissionId: string } | EvaluationDto>;

  /**
   * Get the report of the evaluation.
   *
   * @param {Submission} submission the received submission.
   * @param {AxiosRequestConfig} options for the request
   */
  getEvaluationReport(submission: Submission, options?: AxiosRequestConfig): Promise<EvaluationDto>;
}
