import { Processor, Process, OnQueueCompleted, OnQueueError } from '@nestjs/bull';
import { Job } from 'bull';
import { Trigger } from 'src/hook/enums/trigger.enum';

@Processor('hooksQueue')
export class RewardProcessor {
  @Process(Trigger.REWARD_GRANTED)
  async grantReward(job: Job<unknown>) {
    //check criteria
  }
}
