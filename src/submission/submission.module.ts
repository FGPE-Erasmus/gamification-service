import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubscriptionsModule } from '../common/subscriptions/subscriptions.module';
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
import { ChallengeModule } from 'src/challenge/challenge.module';
import { ValidationSchema } from './models/validation.model';
import { ValidationResolver } from './validation.resolver';
import { ValidationService } from './validation.service';
import { ValidationRepository } from './repositories/validation.repository';
import { ValidationToDtoMapper } from './mappers/validation-to-dto.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Submission',
        schema: SubmissionSchema,
      },
      {
        name: 'Validation',
        schema: ValidationSchema,
      },
    ]),
    forwardRef(() => EventModule),
    forwardRef(() => EvaluationEngineModule),
    forwardRef(() => GameModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => HookModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => ChallengeStatusModule),
    forwardRef(() => SubscriptionsModule),
  ],
  providers: [
    SubmissionToDtoMapper,
    ValidationToDtoMapper,
    SubmissionRepository,
    ValidationRepository,
    SubmissionService,
    ValidationService,
    SubmissionResolver,
    ValidationResolver,
  ],
  exports: [
    SubmissionToDtoMapper,
    ValidationToDtoMapper,
    SubmissionRepository,
    ValidationRepository,
    SubmissionService,
    ValidationService,
  ],
})
export class SubmissionModule {}
