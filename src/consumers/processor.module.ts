import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobProcessor } from './processors/job.processor';
import { QueueListener } from './queue.listener';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'hooksQueue',
    }),
  ],
  providers: [JobProcessor, QueueListener],
})
export class ProcessorModule {}
