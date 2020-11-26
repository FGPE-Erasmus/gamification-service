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
import { Player, PlayerSchema } from './models/player.model';
import { PlayerRepository } from './repositories/player.repository';
import { PlayerToDtoMapper } from './mappers/player-to-dto.mapper';
import { PlayerToPersistenceMapper } from './mappers/player-to-persistence.mapper';
import { PlayerResolver } from './player.resolver';
import { SubscriptionsModule } from 'src/common/subscriptions/subscriptions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Player.name,
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
    forwardRef(() => SubscriptionsModule),
  ],
  providers: [PlayerToDtoMapper, PlayerToPersistenceMapper, PlayerRepository, PlayerService, PlayerResolver],
  exports: [PlayerToDtoMapper, PlayerToPersistenceMapper, PlayerRepository, PlayerService],
})
export class PlayerModule {}
