import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeModule } from '../challenge/challenge.module';
import { HookModule } from '../hook/hook.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { RewardModule } from '../reward/reward.module';
import { SubmissionModule } from '../submission/submission.module';
import { PlayerModule } from '../player/player.module';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';
import { GameToDtoMapper } from './mappers/game-to-dto.mapper';
import { GameSchema } from './models/game.model';
import { GameRepository } from './repositories/game.repository';
import { GameUploadController } from './upload.controller';
import { NotificationModule } from '../notifications/notification.module';
import { SubscriptionsModule } from '../common/subscriptions/subscriptions.module';
import { GameTokenResolver } from './game-token.resolver';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Game',
        schema: GameSchema,
      },
    ]),
    MulterModule,
    forwardRef(() => PlayerModule),
    forwardRef(() => GroupModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => LeaderboardModule),
    forwardRef(() => HookModule),
    forwardRef(() => RewardModule),
    forwardRef(() => SubmissionModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => SubscriptionsModule),
  ],
  controllers: [GameUploadController],
  providers: [GameToDtoMapper, GameRepository, GameService, GameResolver, GameTokenResolver],
  exports: [GameToDtoMapper, GameRepository, GameService],
})
export class GameModule {}
