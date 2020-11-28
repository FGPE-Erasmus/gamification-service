import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeStatusModule } from '../challenge-status/challenge-status.module';
import { EvaluationEngineModule } from '../evaluation-engine/evaluation-engine.module';
import { EventModule } from '../event/event.module';
import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { PlayerModule } from '../player/player.module';
import { SubmissionService } from './submission.service';
import { SubmissionResolver } from './submission.resolver';
import { SubmissionRepository } from './repositories/submission.repository';
import { SubmissionSchema } from './models/submission.model';
import { SubmissionToDtoMapper } from './mappers/submission-to-dto.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Submission',
        schema: SubmissionSchema,
      },
    ]),
    forwardRef(() => EventModule),
    forwardRef(() => EvaluationEngineModule),
    forwardRef(() => GameModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => HookModule),
    forwardRef(() => ChallengeStatusModule),
  ],
  providers: [SubmissionToDtoMapper, SubmissionRepository, SubmissionService, SubmissionResolver],
  exports: [SubmissionToDtoMapper, SubmissionService],
})
export class SubmissionModule {}
