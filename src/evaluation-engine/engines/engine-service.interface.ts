import { Submission } from '../../submission/models/submission.model';
import { EvaluationDto } from '../dto/evaluation.dto';
import { AxiosRequestConfig } from 'axios';
import { ProgrammingLanguageDto } from '../dto/programming-language.dto';
import { ActivityDto } from '../dto/activity.dto';
import { Validation } from '../../submission/models/validation.model';

export interface IEngineService {
  /**
   * Get configured programming languages from evaluation engine.
   *
   * @param courseId {string} ID of the course.
   * @param {AxiosRequestConfig} options for the request
   */
  getLanguages(courseId: string, options?: AxiosRequestConfig): Promise<ProgrammingLanguageDto[]>;

  /**
   * Get configured programming language from evaluation engine.
   *
   * @param courseId {string} ID of the course.
   * @param languageId ID of the language.
   * @param {AxiosRequestConfig} options for the request
   */
  getLanguage(courseId: string, languageId: string, options?: AxiosRequestConfig): Promise<ProgrammingLanguageDto>;

  /**
   * Get activity from evaluation engine.
   *
   * @param courseId {string} ID of the course.
   * @param activityId ID of the activity.
   * @param {AxiosRequestConfig} options for the request
   */
  getActivity(courseId: string, activityId: string, options?: AxiosRequestConfig): Promise<ActivityDto>;

  /**
   * Validate an attempt submission + file against a set of input test cases.
   *
   * @param courseId {string} ID of the course.
   * @param {Validation} validation the received validation.
   * @param {string} filename the name of the file.
   * @param {string} code the file content.
   * @param {string[]} inputs the set of input test cases.
   * @param {AxiosRequestConfig} options for the request
   */
  validate(
    courseId: string,
    validation: Validation,
    filename: string,
    code: string,
    inputs: string[],
    options?: AxiosRequestConfig,
  ): Promise<{ validationId: string } | EvaluationDto>;

  /**
   * Evaluate an attempt submission + file.
   *
   * @param courseId {string} ID of the course.
   * @param {Submission} submission the received submission.
   * @param {string} filename the name of the file.
   * @param {string} code the file content.
   * @param {AxiosRequestConfig} options for the request
   */
  evaluate(
    courseId: string,
    submission: Submission,
    filename: string,
    code: string,
    options?: AxiosRequestConfig,
  ): Promise<{ submissionId: string } | EvaluationDto>;

  /**
   * Get the report of the validation.
   *
   * @param courseId {string} ID of the course.
   * @param {Validation} validation the received validation.
   * @param {AxiosRequestConfig} options for the request.
   */
  getValidationReport(courseId: string, validation: Validation, options?: AxiosRequestConfig): Promise<EvaluationDto>;

  /**
   * Get the report of the evaluation.
   *
   * @param courseId {string} ID of the course.
   * @param {Submission} submission the received submission.
   * @param {AxiosRequestConfig} options for the request.
   */
  getEvaluationReport(courseId: string, submission: Submission, options?: AxiosRequestConfig): Promise<EvaluationDto>;

  /**
   * Get the evaluated program.
   *
   * @param courseId {string} ID of the course.
   * @param {Submission} submission the received submission.
   * @param {AxiosRequestConfig} options for the request.
   * @returns {Promise<string>} evaluated program.
   */
  getEvaluationProgram(courseId: string, submission: Submission, options?: AxiosRequestConfig): Promise<string>;

  /**
   * Get the validated program.
   *
   * @param courseId {string} ID of the course.
   * @param {Validation} validation the received validation.
   * @param {AxiosRequestConfig} options for the request.
   * @returns {Promise<string>} validated program.
   */
  getValidationProgram(courseId: string, validation: Validation, options?: AxiosRequestConfig): Promise<string>;
}
