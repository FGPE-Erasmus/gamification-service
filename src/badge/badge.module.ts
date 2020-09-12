import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeRepository } from './repository/badge.repository';
import { BadgeService } from './badge.service';
import { BadgeResolver } from './badge.resolver';
import { PlayerRepository } from 'src/player/repository/player.repository';
import { BullModule } from '@nestjs/bull';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { QueueConfigService } from 'src/queue.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([BadgeRepository]),
    TypeOrmModule.forFeature([PlayerRepository]),
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
  ],
  providers: [BadgeService, BadgeResolver, ServiceHelper],
  exports: [BadgeService],
})
export class BadgeModule {}
