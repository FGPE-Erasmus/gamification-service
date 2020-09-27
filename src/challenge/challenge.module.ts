import { forwardRef, Module } from '@nestjs/common';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';

import { ServiceHelper } from '../common/helpers/service.helper';
import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { RewardModule } from '../reward/reward.module';

import { ChallengeService } from './challenge.service';
import { ChallengeRepository } from './repositories/challenge.repository';
import { ChallengeResolver } from './challenge.resolver';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([ChallengeRepository]),
    forwardRef(() => GameModule),
    HookModule,
    LeaderboardModule,
    forwardRef(() => RewardModule),
  ],
  providers: [ServiceHelper, ChallengeResolver, ChallengeService],
  exports: [ChallengeService],
})
export class ChallengeModule {}
