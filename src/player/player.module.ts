import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ServiceHelper } from '../common/helpers/service.helper';
import { ChallengeStatusModule } from '../challenge-status/challenge-status.module';
import { GameModule } from '../game/game.module';
import { PlayerRewardModule } from '../player-reward/player-reward.module';
import { SubmissionModule } from '../submission/submission.module';
import { UsersModule } from '../users/users.module';
import { PlayerService } from './player.service';
import { Player, PlayerSchema } from './models/player.model';
import { PlayerRepository } from './repositories/player.repository';
import { PlayerToDtoMapper } from './mappers/player-to-dto.mapper';
import { PlayerToPersistenceMapper } from './mappers/player-to-persistence.mapper';
import { PlayerResolver } from './player.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Player.name,
        schema: PlayerSchema,
      },
    ]),
    forwardRef(() => GameModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ChallengeStatusModule),
    forwardRef(() => PlayerRewardModule),
    forwardRef(() => SubmissionModule),
  ],
  providers: [
    PlayerToDtoMapper,
    PlayerToPersistenceMapper,
    ServiceHelper,
    PlayerRepository,
    PlayerService,
    PlayerResolver,
  ],
  exports: [PlayerToDtoMapper, PlayerToPersistenceMapper, PlayerService],
})
export class PlayerModule {}
