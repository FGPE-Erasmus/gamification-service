import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LeaderboardService } from './leaderboard.service';
import { Leaderboard, LeaderboardSchema } from './models/leaderboard.model';
import { LeaderboardRepository } from './repository/leaderboard.repository';
import { LeaderboardResolver } from './leaderboard.resolver';
import { LeaderboardToDtoMapper } from './mappers/leaderboard-to-dto.mapper';
import { LeaderboardToPersistenceMapper } from './mappers/leaderboard-to-persistence.mapper';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Leaderboard.name,
        useFactory: () => LeaderboardSchema
      }
    ]),

  ],
  providers: [
    LeaderboardToDtoMapper,
    LeaderboardToPersistenceMapper,
    LeaderboardRepository,
    LeaderboardService,
    LeaderboardResolver,
  ],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
