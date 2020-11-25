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
import { GameToPersistenceMapper } from './mappers/game-to-persistence.mapper';
import { Game, GameSchema } from './models/game.model';
import { GameRepository } from './repositories/game.repository';
import { GameUploadController } from './upload.controller';
import { SubscriptionsModule } from 'src/common/subscriptions/subscriptions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Game.name,
        schema: GameSchema,
      },
    ]),
    MulterModule,
    forwardRef(() => UsersModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => LeaderboardModule),
    forwardRef(() => HookModule),
    forwardRef(() => RewardModule),
    forwardRef(() => SubmissionModule),
  ],
  controllers: [GameUploadController],
  providers: [GameToDtoMapper, GameToPersistenceMapper, GameRepository, GameService, GameResolver],
  exports: [GameToDtoMapper, GameToPersistenceMapper, GameRepository, GameService],
})
export class GameModule {}
