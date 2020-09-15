import { Module } from '@nestjs/common';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { LeaderboardService } from './leaderboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardRepository } from './repository/leaderboard.repository';
import { PlayerLeaderboardRepository } from 'src/player-leaderboard/repository/player-leaderboard.repository';
import { ChallengeModule } from 'src/challenge/challenge.module';
import { ChallengeRepository } from 'src/challenge/repositories/challenge.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaderboardRepository, PlayerLeaderboardRepository, ChallengeRepository]),
    ChallengeModule,
  ],
  providers: [ServiceHelper, LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
