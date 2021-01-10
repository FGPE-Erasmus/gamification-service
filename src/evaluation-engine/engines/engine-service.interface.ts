import { Submission } from '../../submission/models/submission.model';
import { EvaluationDto } from '../dto/evaluation.dto';
import { AxiosRequestConfig } from 'axios';
import { ProgrammingLanguageDto } from '../dto/programming-language.dto';
import { ActivityDto } from '../dto/activity.dto';

export interface IEngineService {
  /**
   * Get configured programming languages from evaluation engine.
   *
   * @param gameId ID of the game.
   * @param {AxiosRequestConfig} options for the request
   */
  getLanguages(gameId: string, options?: AxiosRequestConfig): Promise<ProgrammingLanguageDto[]>;

  /**
   * Get configured programming language from evaluation engine.
   *
   * @param gameId ID of the game.
   * @param languageId ID of the language.
   * @param {AxiosRequestConfig} options for the request
   */
  getLanguage(gameId: string, languageId: string, options?: AxiosRequestConfig): Promise<ProgrammingLanguageDto>;

  /**
   * Get activity from evaluation engine.
   *
   * @param gameId ID of the game.
   * @param activityId ID of the activity.
   * @param {AxiosRequestConfig} options for the request
   */
  getActivity(gameId: string, activityId: string, options?: AxiosRequestConfig): Promise<ActivityDto>;

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
   * @param {AxiosRequestConfig} options for the request.
   */
  getEvaluationReport(submission: Submission, options?: AxiosRequestConfig): Promise<EvaluationDto>;

  /**
   * Get the evaluated program.
   *
   * @param {Submission} submission the received submission.
   * @param {AxiosRequestConfig} options for the request.
   * @returns {Promise<string>} evaluated program.
   */
  getEvaluationProgram(submission: Submission, options?: AxiosRequestConfig): Promise<string>;
}
