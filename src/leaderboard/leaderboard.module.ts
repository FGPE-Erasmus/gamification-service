import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeModule } from '../challenge/challenge.module';
import { UsersModule } from '../users/users.module';
import { GameModule } from '../game/game.module';
import { LeaderboardService } from './leaderboard.service';
import { Leaderboard, LeaderboardSchema } from './models/leaderboard.model';
import { LeaderboardRepository } from './repositories/leaderboard.repository';
import { LeaderboardResolver } from './leaderboard.resolver';
import { LeaderboardToDtoMapper } from './mappers/leaderboard-to-dto.mapper';
import { LeaderboardToPersistenceMapper } from './mappers/leaderboard-to-persistence.mapper';
import { PlayerModule } from 'src/player/player.module';
import { SubmissionModule } from 'src/submission/submission.module';
import { RankingResolver } from './ranking.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Leaderboard.name, schema: LeaderboardSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => GameModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => SubmissionModule),
  ],
  providers: [
    LeaderboardToDtoMapper,
    LeaderboardToPersistenceMapper,
    LeaderboardRepository,
    LeaderboardService,
    LeaderboardResolver,
    RankingResolver,
  ],
  exports: [LeaderboardToDtoMapper, LeaderboardToPersistenceMapper, LeaderboardService],
})
export class LeaderboardModule {}
