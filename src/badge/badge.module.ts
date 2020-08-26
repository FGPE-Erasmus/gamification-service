import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeRepository } from './repository/badge.repository';
import { BadgeService } from './badge.service';
import { BadgeResolver } from './badge.resolver';
import { PlayerRepository } from 'src/player/repository/player.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BadgeRepository]), TypeOrmModule.forFeature([PlayerRepository])],
  providers: [BadgeService, BadgeResolver],
  exports: [BadgeService],
})
export class BadgeModule {}
