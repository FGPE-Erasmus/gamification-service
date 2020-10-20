import { InjectQueue, OnGlobalQueueCompleted, OnGlobalQueueError, OnGlobalQueueFailed, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Queue } from 'bull';

import { appConfig } from '../app.config';

@Processor(appConfig.queue.evaluation.name)
export class EvaluationEngineListener {
  protected readonly logger: Logger = new Logger(EvaluationEngineListener.name);

  constructor(@InjectQueue(appConfig.queue.evaluation.name) protected readonly evaluationQueue: Queue) {}

  @OnGlobalQueueCompleted()
  async onGlobalCompleted(jobId: number, result: any): Promise<void> {
    const job = await this.evaluationQueue.getJob(jobId);
    this.logger.debug(`(Global) on completed: job ${job.id} -> result: ${result}`);
  }

  @OnGlobalQueueFailed()
  async onGlobalQueueFailed(jobId: number, error: Error): Promise<void> {
    const job = await this.evaluationQueue.getJob(jobId);
    this.logger.debug(`(Global) on queue failed: job ${job.id} -> error: ${error}`);
  }

  @OnGlobalQueueError()
  async onGlobalQueueError(error: Error): Promise<void> {
    this.logger.debug(`(Global) on error: ${error}`);
  }
}
