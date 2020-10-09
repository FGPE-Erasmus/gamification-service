import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';

import { QueueConfigService } from '../queue.config';
import { ChallengeModule } from '../challenge/challenge.module';
import { PlayerModule } from '../player/player.module';
import { ChallengeStatusService } from './challenge-status.service';
import { ChallengeStatusResolver } from './challenge-status.resolver';
import { ChallengeStatus, ChallengeStatusSchema } from './models/challenge-status.model';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';
import { ChallengeStatusToDtoMapper } from './mappers/challenge-status-to-dto.mapper';

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
    forwardRef(() => PlayerModule),
    forwardRef(() => ChallengeModule),
  ],
  providers: [ChallengeStatusToDtoMapper, ChallengeStatusRepository, ChallengeStatusService, ChallengeStatusResolver],
  exports: [ChallengeStatusToDtoMapper, ChallengeStatusService],
})
export class ChallengeStatusModule {}
