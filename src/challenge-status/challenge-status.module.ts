import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';

import { QueueConfigService } from '../queue.config';
import { ChallengeStatusService } from './challenge-status.service';
import { ChallengeStatusResolver } from './challenge-status.resolver';
import { ChallengeStatus, ChallengeStatusSchema } from './models/challenge-status.model';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';
import { ChallengeStatusToDtoMapper } from './mappers/challenge-status-to-dto.mapper';
import { ChallengeStatusToPersistenceMapper } from './mappers/challenge-status-to-persistence.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ChallengeStatus.name,
        schema: ChallengeStatusSchema,
      },
    ]),
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
  ],
  providers: [
    ChallengeStatusToDtoMapper,
    ChallengeStatusToPersistenceMapper,
    ChallengeStatusRepository,
    ChallengeStatusService,
    ChallengeStatusResolver,
  ],
  exports: [ChallengeStatusService],
})
export class ChallengeStatusModule {}
