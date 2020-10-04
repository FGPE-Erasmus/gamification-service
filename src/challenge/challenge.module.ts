import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { RewardModule } from '../reward/reward.module';

import { ChallengeService } from './challenge.service';
import { ChallengeResolver } from './challenge.resolver';
import { Challenge, ChallengeSchema } from './models/challenge.model';
import { ChallengeRepository } from './repositories/challenge.repository';
import { ChallengeToDtoMapper } from './mappers/challenge-to-dto.mapper';
import { ChallengeToPersistenceMapper } from './mappers/challenge-to-persistence.mapper';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Challenge.name,
        useFactory: () => ChallengeSchema
      }
    ]),
    forwardRef(() => GameModule),
    HookModule,
    LeaderboardModule,
    forwardRef(() => RewardModule),
  ],
  providers: [
    ChallengeToDtoMapper,
    ChallengeToPersistenceMapper,
    ChallengeRepository,
    ChallengeService,
    ChallengeResolver
  ],
  exports: [ChallengeService],
})
export class ChallengeModule {}
