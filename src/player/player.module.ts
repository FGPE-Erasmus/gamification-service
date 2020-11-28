import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeStatusModule } from '../challenge-status/challenge-status.module';
import { GameModule } from '../game/game.module';
import { GroupModule } from '../group/group.module';
import { EventModule } from '../event/event.module';
import { PlayerRewardModule } from '../player-reward/player-reward.module';
import { SubmissionModule } from '../submission/submission.module';
import { UsersModule } from '../users/users.module';
import { PlayerService } from './player.service';
import { PlayerSchema } from './models/player.model';
import { PlayerRepository } from './repositories/player.repository';
import { PlayerToDtoMapper } from './mappers/player-to-dto.mapper';
import { PlayerResolver } from './player.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Player',
        schema: PlayerSchema,
      },
    ]),
    forwardRef(() => EventModule),
    forwardRef(() => GameModule),
    forwardRef(() => UsersModule),
    forwardRef(() => GroupModule),
    forwardRef(() => ChallengeStatusModule),
    forwardRef(() => PlayerRewardModule),
    forwardRef(() => SubmissionModule),
  ],
  providers: [PlayerToDtoMapper, PlayerRepository, PlayerService, PlayerResolver],
  exports: [PlayerToDtoMapper, PlayerRepository, PlayerService],
})
export class PlayerModule {}
