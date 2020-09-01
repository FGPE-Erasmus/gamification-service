import { Module } from '@nestjs/common';
import { RewardProcessor } from './reward.processor';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'hooksQueue',
    }),
  ],
  providers: [RewardProcessor],
})
export class ProcessorModule {}
