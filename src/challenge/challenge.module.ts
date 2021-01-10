import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubscriptionsModule } from '../common/subscriptions/subscriptions.module';
import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { RewardModule } from '../reward/reward.module';

import { ChallengeService } from './challenge.service';
import { ChallengeResolver } from './challenge.resolver';
import { ChallengeToDtoMapper } from './mappers/challenge-to-dto.mapper';
import { ChallengeSchema } from './models/challenge.model';
import { ChallengeRepository } from './repositories/challenge.repository';
import { PlayerModule } from '../player/player.module';
import { EvaluationEngineModule } from '../evaluation-engine/evaluation-engine.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Challenge', schema: ChallengeSchema }]),
    forwardRef(() => GameModule),
    forwardRef(() => EvaluationEngineModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => HookModule),
    forwardRef(() => LeaderboardModule),
    forwardRef(() => RewardModule),
    forwardRef(() => SubscriptionsModule),
  ],
  providers: [ChallengeToDtoMapper, ChallengeRepository, ChallengeService, ChallengeResolver],
  exports: [ChallengeToDtoMapper, ChallengeRepository, ChallengeService],
})
export class ChallengeModule {}
