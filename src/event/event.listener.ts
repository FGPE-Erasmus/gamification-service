import { InjectQueue, OnGlobalQueueCompleted, OnGlobalQueueError, OnGlobalQueueFailed, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Queue } from 'bull';

import { appConfig } from '../app.config';

@Processor(appConfig.queue.event.name)
export class EventListener {
  protected readonly logger: Logger = new Logger(EventListener.name);

  constructor(@InjectQueue(appConfig.queue.event.name) protected readonly eventQueue: Queue) {}

  @OnGlobalQueueCompleted()
  async onGlobalCompleted(jobId: number, result: any): Promise<void> {
    const job = await this.eventQueue.getJob(jobId);
    this.logger.debug(`(Global) on completed: job ${job.id} - ${job.name} -> result: ${result}`);
  }

  @OnGlobalQueueFailed()
  async onGlobalQueueFailed(jobId: number, error: Error): Promise<void> {
    const job = await this.eventQueue.getJob(jobId);
    this.logger.debug(
      `(Global) on queue failed: job ${job.id} - ${job.name} -> error: ${error}, stack: ${error.stack}`,
    );
  }

  @OnGlobalQueueError()
  async onGlobalQueueError(error: Error): Promise<void> {
    this.logger.debug(`(Global) on error: ${error}`);
  }
}
