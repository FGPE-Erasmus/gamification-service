import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubscriptionsModule } from '../common/subscriptions/subscriptions.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { EventModule } from '../event/event.module';
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
import { RewardSchema } from './models/reward.model';
import { RewardRepository } from './repositories/reward.repository';
import { RewardToDtoMapper } from './mappers/reward-to-dto.mapper';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Reward',
        schema: RewardSchema,
      },
    ]),
    forwardRef(() => EventModule),
    forwardRef(() => GameModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => HookModule),
    forwardRef(() => SubscriptionsModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [
    RewardToDtoMapper,
    RewardRepository,
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
  exports: [RewardToDtoMapper, RewardRepository, RewardService],
})
export class RewardModule {}
