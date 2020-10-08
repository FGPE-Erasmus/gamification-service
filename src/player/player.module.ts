import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ServiceHelper } from '../common/helpers/service.helper';
import { ChallengeModule } from '../challenge/challenge.module';
import { GameModule } from '../game/game.module';
import { SubmissionModule } from '../submission/submission.module';
import { UsersModule } from '../users/users.module';
import { PlayerService } from './player.service';
import { Player, PlayerSchema } from './models/player.model';
import { PlayerRepository } from './repositories/player.repository';
import { PlayerToDtoMapper } from './mappers/player-to-dto.mapper';
import { PlayerToPersistenceMapper } from './mappers/player-to-persistence.mapper';
import { PlayerResolver } from './player.resolver';
import { ChallengeStatusModule } from '../challenge-status/challenge-status.module';
import { PlayerRewardModule } from '../player-reward/player-reward.module';

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
    forwardRef(() => SubmissionModule),
    forwardRef(() => ChallengeStatusModule),
    forwardRef(() => PlayerRewardModule),
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
