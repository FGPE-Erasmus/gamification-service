import { Module } from '@nestjs/common';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { LeaderboardService } from './leaderboard.service';

@Module({
  providers: [ServiceHelper, LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
