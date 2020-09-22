import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { QueueConfigService } from '../queue.config';
import { ServiceHelper } from '../common/helpers/service.helper';
import { ChallengeModule } from '../challenge/challenge.module';
import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { PlayerModule } from '../player/player.module';
import { RewardRepository } from './repository/reward.repository';
import { RewardService } from './reward.service';
import { RewardResolver } from './reward.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([RewardRepository]),
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
    forwardRef(() => GameModule),
    forwardRef(() => ChallengeModule),
    HookModule,
    PlayerModule,
  ],
  providers: [ServiceHelper, RewardService, RewardResolver],
  exports: [RewardService],
})
export class RewardModule {}
