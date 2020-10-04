import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';

import { DateScalar } from '../common/scalars/date.scalar';
import { ChallengeModule } from '../challenge/challenge.module';
import { HookModule } from '../hook/hook.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { RewardModule } from '../reward/reward.module';
import { UsersModule } from '../users/users.module';
import { GameUploadController } from './upload.controller';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';
import { Game, GameSchema } from './models/game.model';
import { GameRepository } from './repositories/game.repository';


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Game.name,
        useFactory: () => GameSchema
      }
    ]),
    MulterModule,
    UsersModule,
    ChallengeModule,
    HookModule,
    LeaderboardModule,
    RewardModule,
  ],
  controllers: [ GameUploadController ],
  providers: [ GameRepository, GameService, GameResolver ],
  exports: [ GameService ],
})
export class GameModule {
}
