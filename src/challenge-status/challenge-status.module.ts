import { Module } from '@nestjs/common';
import { ChallengeStatusService } from './challenge-status.service';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';
import { ChallengeStatusResolver } from './challenge-status.resolver';
import { ServiceHelper } from '../common/helpers/service.helper';
import { BullModule } from '@nestjs/bull';
import { QueueConfigService } from 'src/queue.config';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([ChallengeStatusRepository]),
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
  ],
  providers: [ChallengeStatusService, ServiceHelper, ChallengeStatusResolver],
  exports: [ChallengeStatusService],
})
export class ChallengeStatusModule {}
