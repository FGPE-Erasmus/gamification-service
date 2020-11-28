import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeModule } from '../challenge/challenge.module';
import { HookModule } from '../hook/hook.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { RewardModule } from '../reward/reward.module';
import { SubmissionModule } from '../submission/submission.module';
import { PlayerModule } from '../player/player.module';
import { UsersModule } from '../users/users.module';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';
import { GameToDtoMapper } from './mappers/game-to-dto.mapper';
import { GameSchema } from './models/game.model';
import { GameRepository } from './repositories/game.repository';
import { GameUploadController } from './upload.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Game',
        schema: GameSchema,
      },
    ]),
    MulterModule,
    forwardRef(() => UsersModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => ChallengeModule),
    LeaderboardModule,
    HookModule,
    RewardModule,
    forwardRef(() => SubmissionModule),
  ],
  controllers: [GameUploadController],
  providers: [GameToDtoMapper, GameRepository, GameService, GameResolver],
  exports: [GameToDtoMapper, GameRepository, GameService],
})
export class GameModule {}
