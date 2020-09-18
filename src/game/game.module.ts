import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameUploadController } from './upload.controller';
import { UsersModule } from 'src/users/users.module';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';
import { ScheduledHookRepository } from 'src/hook/repository/scheduled-hook.repository';
import { ActionHookRepository } from 'src/hook/repository/action-hook.repository';
import { HookService } from 'src/hook/hook.service';
import { ChallengeModule } from 'src/challenge/challenge.module';
import { GameRepository } from './repositories/game.repository';
import { DateScalar } from '../common/scalars/date.scalar';
import { LeaderboardModule } from 'src/leaderboard/leaderboard.module';

@Module({
  imports: [
    MulterModule,
    UsersModule,
    ChallengeModule,
    LeaderboardModule,
    TypeOrmModule.forFeature([GameRepository, ScheduledHookRepository, ActionHookRepository]),
  ],
  controllers: [GameUploadController],
  providers: [DateScalar, GameService, GameResolver, HookService],
  exports: [GameService],
})
export class GameModule {}
