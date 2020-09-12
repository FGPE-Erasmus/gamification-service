import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionHookRepository } from 'src/hook/repository/action-hook.repository';
import { RewardService } from 'src/reward/reward.service';
import { QueueListener } from './queue.listener';
import { BadgeRepository } from 'src/badge/repository/badge.repository';
import { CouponRepository } from 'src/coupon/repository/coupon.repository';
import { HintRepository } from 'src/hint/repository/hint.repository';
import { VirtualItemRepository } from 'src/virtual-item/repository/virtual-item.repository';
import { PlayerRepository } from 'src/player/repository/player.repository';
import { QueueConfigService } from 'src/queue.config';
import { JobProcessor } from './processors/job.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActionHookRepository,
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
  providers: [JobProcessor, QueueListener, RewardService],
})
export class ProcessorModule {}
