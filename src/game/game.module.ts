import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeModule } from '../challenge/challenge.module';
import { HookModule } from '../hook/hook.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { RewardModule } from '../reward/reward.module';
import { SubmissionModule } from '../submission/submission.module';
import { UsersModule } from '../users/users.module';
import { GameUploadController } from './upload.controller';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';
import { Game, GameSchema } from './models/game.model';
import { GameRepository } from './repositories/game.repository';
import { GameToDtoMapper } from './mappers/game-to-dto.mapper';
import { GameToPersistenceMapper } from './mappers/game-to-persistence.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Game.name,
        schema: GameSchema,
      },
    ]),
    MulterModule,
    ChallengeModule,
    LeaderboardModule,
    HookModule,
    RewardModule,
    SubmissionModule,
    UsersModule,
  ],
  controllers: [GameUploadController],
  providers: [GameToDtoMapper, GameToPersistenceMapper, GameRepository, GameService, GameResolver],
  exports: [GameToDtoMapper, GameToPersistenceMapper, GameService],
})
export class GameModule {}
