import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeRepository } from './repository/badge.repository';
import { BadgeService } from './badge.service';
import { BadgeResolver } from './badge.resolver';
import { PlayerRepository } from 'src/player/repository/player.repository';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([BadgeRepository]),
    TypeOrmModule.forFeature([PlayerRepository]),
    BullModule.registerQueue({
      name: 'hooksQueue',
    }),
  ],
  providers: [BadgeService, BadgeResolver],
  exports: [BadgeService],
})
export class BadgeModule {}
