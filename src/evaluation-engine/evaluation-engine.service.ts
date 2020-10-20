import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { appConfig } from '../app.config';
import { IFile } from '../common/interfaces/file.interface';
import { streamToString } from '../common/utils/stream.utils';
import { REQUEST_EVALUATION_JOB } from './evaluation-engine.constants';

@Injectable()
export class EvaluationEngineService {
  protected readonly logger: Logger = new Logger(EvaluationEngineService.name);

  constructor(@InjectQueue(appConfig.queue.evaluation.name) protected readonly evaluationQueue: Queue) {}

  async evaluate(submissionId: string, file: IFile): Promise<void> {
    const content: string = await streamToString(file.content);
    await this.evaluationQueue.add(REQUEST_EVALUATION_JOB, {
      submissionId,
      filename: file.filename,
      content,
    });
  }
}
