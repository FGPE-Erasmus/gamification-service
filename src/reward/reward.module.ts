import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';

import { QueueConfigService } from '../queue.config';
import { ServiceHelper } from '../common/helpers/service.helper';
import { ChallengeModule } from '../challenge/challenge.module';
import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { PlayerModule } from '../player/player.module';
import { RewardService } from './reward.service';
import { RewardResolver } from './reward.resolver';
import { BadgeResolver } from './badge.resolver';
import { CouponResolver } from './coupon.resolver';
import { HintResolver } from './hint.resolver';
import { MessageResolver } from './message.resolver';
import { PointResolver } from './point.resolver';
import { VirtualItemResolver } from './virtual-item.resolver';
import { UnlockResolver } from './unlock.resolver';
import { RevealResolver } from './reveal.resolver';
import { Reward, RewardSchema } from './models/reward.model';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Reward.name,
        useFactory: () => RewardSchema
      }
    ]),
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
    forwardRef(() => GameModule),
    forwardRef(() => ChallengeModule),
    HookModule,
    PlayerModule,
  ],
  providers: [
    ServiceHelper,
    RewardService,
    RewardResolver,
    BadgeResolver,
    CouponResolver,
    HintResolver,
    MessageResolver,
    PointResolver,
    RevealResolver,
    VirtualItemResolver,
    UnlockResolver,
  ],
  exports: [RewardService],
})
export class RewardModule {}
