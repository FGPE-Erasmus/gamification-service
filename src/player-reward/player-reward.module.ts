import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';

import { QueueConfigService } from '../queue.config';
import { ChallengeModule } from '../challenge/challenge.module';
import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { PlayerModule } from '../player/player.module';
import { RewardModule } from '../reward/reward.module';
import { PlayerRewardService } from './player-reward.service';
import { PlayerRewardRepository } from './repositories/player-reward.repository';
import { PlayerReward, PlayerRewardSchema } from './models/player-reward.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PlayerReward.name,
        schema: PlayerRewardSchema,
      },
    ]),
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
    forwardRef(() => GameModule),
    forwardRef(() => ChallengeModule),
    HookModule,
    forwardRef(() => PlayerModule),
    forwardRef(() => RewardModule),
  ],
  providers: [PlayerRewardRepository, PlayerRewardService],
  exports: [PlayerRewardService],
})
export class PlayerRewardModule {}
