import { Module } from '@nestjs/common';
import { PlayerLeaderboardService } from './player-leaderboard.service';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerLeaderboardRepository } from './repository/player-leaderboard.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerLeaderboardRepository])],
  providers: [ServiceHelper, PlayerLeaderboardService],
  exports: [PlayerLeaderboardService],
})
export class PlayerLeaderboardModule {}
