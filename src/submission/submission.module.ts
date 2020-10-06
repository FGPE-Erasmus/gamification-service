import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { SubmissionResolver } from './submission.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionRepository } from './repository/submission.repository';
import { BullModule } from '@nestjs/bull';
import { QueueConfigService } from 'src/queue.config';
import { ActionHookRepository } from 'src/hook/repository/action-hook.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionRepository, ActionHookRepository]),
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
  ],
  exports: [SubmissionService],
  providers: [SubmissionService, ServiceHelper, SubmissionResolver],
})
export class SubmissionModule {}
