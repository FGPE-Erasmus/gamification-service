import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeModule } from '../challenge/challenge.module';
import { UsersModule } from '../users/users.module';
import { GameModule } from '../game/game.module';
import { PlayerModule } from '../player/player.module';
import { SubmissionModule } from '../submission/submission.module';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardSchema } from './models/leaderboard.model';
import { LeaderboardRepository } from './repositories/leaderboard.repository';
import { LeaderboardResolver } from './leaderboard.resolver';
import { LeaderboardToDtoMapper } from './mappers/leaderboard-to-dto.mapper';
import { RankingResolver } from './ranking.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Leaderboard', schema: LeaderboardSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => GameModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => SubmissionModule),
  ],
  providers: [LeaderboardToDtoMapper, LeaderboardRepository, LeaderboardService, LeaderboardResolver, RankingResolver],
  exports: [LeaderboardToDtoMapper, LeaderboardService],
})
export class LeaderboardModule {}
