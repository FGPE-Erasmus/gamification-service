import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceHelper } from '../common/helpers/service.helper';
import { PlayerLeaderboardRepository } from '../player-leaderboard/repository/player-leaderboard.repository';

import { LeaderboardService } from './leaderboard.service';
import { LeaderboardRepository } from './repository/leaderboard.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LeaderboardRepository, PlayerLeaderboardRepository])],
  providers: [ServiceHelper, LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
