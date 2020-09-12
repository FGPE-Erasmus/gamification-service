import { Module } from '@nestjs/common';
import { RewardService } from './reward.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeRepository } from 'src/badge/repository/badge.repository';
import { BullModule } from '@nestjs/bull';
import { QueueConfigService } from 'src/queue.config';
import { CouponRepository } from 'src/coupon/repository/coupon.repository';
import { HintRepository } from 'src/hint/repository/hint.repository';
import { VirtualItemRepository } from 'src/virtual-item/repository/virtual-item.repository';
import { PlayerRepository } from 'src/player/repository/player.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BadgeRepository,
      CouponRepository,
      HintRepository,
      VirtualItemRepository,
      PlayerRepository,
    ]),
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
  ],
  providers: [RewardService],
  exports: [RewardService],
})
export class RewardModule {}
