import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeRepository } from './repository/badge.repository';
import { BadgeService } from './badge.service';
import { BadgeResolver } from './badge.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([BadgeRepository])],
  providers: [BadgeService, BadgeResolver],
  exports: [BadgeService],
})
export class BadgeModule {}
