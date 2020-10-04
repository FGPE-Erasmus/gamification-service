import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ServiceHelper } from '../common/helpers/service.helper';
import { PlayerLeaderboardService } from './player-leaderboard.service';
import { PlayerLeaderboard, PlayerLeaderboardSchema } from './models/player-leaderboard.model';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: PlayerLeaderboard.name,
        useFactory: () => PlayerLeaderboardSchema
      }
    ]),
  ],
  providers: [ServiceHelper, PlayerLeaderboardService],
  exports: [PlayerLeaderboardService],
})
export class PlayerLeaderboardModule {}
