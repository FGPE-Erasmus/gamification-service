import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeModule } from '../challenge/challenge.module';
import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { PlayerModule } from '../player/player.module';
import { RewardModule } from '../reward/reward.module';
import { PlayerRewardService } from './player-reward.service';
import { PlayerRewardRepository } from './repositories/player-reward.repository';
import { PlayerReward, PlayerRewardSchema } from './models/player-reward.model';
import { PlayerRewardToDtoMapper } from './mappers/player-reward-to-dto.mapper';
import { PlayerRewardResolver } from './player-reward.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PlayerReward.name,
        schema: PlayerRewardSchema,
      },
    ]),
    forwardRef(() => GameModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => RewardModule),
    forwardRef(() => HookModule),
  ],
  providers: [PlayerRewardToDtoMapper, PlayerRewardRepository, PlayerRewardResolver, PlayerRewardService],
  exports: [PlayerRewardToDtoMapper, PlayerRewardResolver, PlayerRewardService],
})
export class PlayerRewardModule {}
