import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';

import { QueueConfigService } from '../queue.config';
import { GameModule } from '../game/game.module';
import { PlayerModule } from '../player/player.module';
import { SubmissionService } from './submission.service';
import { SubmissionResolver } from './submission.resolver';
import { SubmissionRepository } from './repositories/submission.repository';
import { Submission, SubmissionSchema } from './models/submission.model';
import { SubmissionToDtoMapper } from './mappers/submission-to-dto.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Submission.name,
        schema: SubmissionSchema,
      },
    ]),
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
    forwardRef(() => GameModule),
    forwardRef(() => PlayerModule),
  ],
  providers: [SubmissionToDtoMapper, SubmissionRepository, SubmissionService, SubmissionResolver],
  exports: [SubmissionToDtoMapper, SubmissionService],
})
export class SubmissionModule {}
