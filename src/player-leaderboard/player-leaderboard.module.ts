import { Module } from '@nestjs/common';
import { PlayerLeaderboardService } from './player-leaderboard.service';
import { ServiceHelper } from 'src/common/helpers/service.helper';

@Module({
  providers: [ServiceHelper, PlayerLeaderboardService],
  exports: [PlayerLeaderboardService],
})
export class PlayerLeaderboardModule {}
