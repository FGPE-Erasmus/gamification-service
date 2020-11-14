import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { RewardModule } from '../reward/reward.module';
import { UsersModule } from '../users/users.module';

import { ChallengeService } from './challenge.service';
import { ChallengeResolver } from './challenge.resolver';
import { ChallengeToDtoMapper } from './mappers/challenge-to-dto.mapper';
import { Challenge, ChallengeSchema } from './models/challenge.model';
import { ChallengeRepository } from './repositories/challenge.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Challenge.name, schema: ChallengeSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => GameModule),
    forwardRef(() => HookModule),
    forwardRef(() => LeaderboardModule),
    forwardRef(() => RewardModule),
  ],
  providers: [ChallengeToDtoMapper, ChallengeRepository, ChallengeService, ChallengeResolver],
  exports: [ChallengeToDtoMapper, ChallengeRepository, ChallengeService],
})
export class ChallengeModule {}
