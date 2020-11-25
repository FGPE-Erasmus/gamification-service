import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EvaluationEngineModule } from '../evaluation-engine/evaluation-engine.module';
import { EventModule } from '../event/event.module';
import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { PlayerModule } from '../player/player.module';
import { SubmissionService } from './submission.service';
import { SubmissionResolver } from './submission.resolver';
import { SubmissionRepository } from './repositories/submission.repository';
import { Submission, SubmissionSchema } from './models/submission.model';
import { SubmissionToDtoMapper } from './mappers/submission-to-dto.mapper';
import { ChallengeStatusModule } from 'src/challenge-status/challenge-status.module';
import { SubscriptionsModule } from 'src/common/subscriptions/subscriptions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Submission.name,
        schema: SubmissionSchema,
      },
    ]),
    forwardRef(() => EventModule),
    forwardRef(() => EvaluationEngineModule),
    forwardRef(() => GameModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => HookModule),
    forwardRef(() => ChallengeStatusModule),
    forwardRef(() => SubscriptionsModule),
  ],
  providers: [SubmissionToDtoMapper, SubmissionRepository, SubmissionService, SubmissionResolver],
  exports: [SubmissionToDtoMapper, SubmissionService],
})
export class SubmissionModule {}
