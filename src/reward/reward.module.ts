import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

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
import { Reward, RewardSchema } from './models/reward.model';
import { RewardRepository } from './repositories/reward.repository';
import { RewardToDtoMapper } from './mappers/reward-to-dto.mapper';
import { RewardToPersistenceMapper } from './mappers/reward-to-persistence.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Reward.name,
        schema: RewardSchema,
      },
    ]),
    forwardRef(() => EventModule),
    forwardRef(() => GameModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => HookModule),
  ],
  providers: [
    RewardToDtoMapper,
    RewardToPersistenceMapper,
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
  exports: [RewardToDtoMapper, RewardToPersistenceMapper, RewardService],
})
export class RewardModule {}
