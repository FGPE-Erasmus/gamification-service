import { Processor, OnQueueCompleted, OnQueueError, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('hooksQueue')
export class QueueListener {
  @OnQueueCompleted()
  async performAction(job: Job, result: any): Promise<any> {
    console.log('Performing the action...');
    console.log(result);
    return true;
  }

  @OnQueueError()
  async showError(error: Error): Promise<any> {
    console.error(error);
  }

  @OnQueueFailed()
  async showFailure(job: Job, error: Error): Promise<any> {
    console.log(`Job ${job.id} - ${job.name} has failed due to the following error...`);
    console.error(error);
  }
}
