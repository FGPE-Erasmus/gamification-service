import { Module } from '@nestjs/common';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { LeaderboardService } from './leaderboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardRepository } from './repository/leaderboard.repository';
import { PlayerLeaderboardRepository } from 'src/player-leaderboard/repository/player-leaderboard.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LeaderboardRepository]), TypeOrmModule.forFeature([PlayerLeaderboardRepository])],
  providers: [ServiceHelper, LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
