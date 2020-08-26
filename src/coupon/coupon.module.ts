import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponRepository } from './repository/coupon.repository';
import { CouponService } from './coupon.service';
import { CouponResolver } from './coupon.resolver';
import { PlayerRepository } from 'src/player/repository/player.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CouponRepository]), TypeOrmModule.forFeature([PlayerRepository])],
  providers: [CouponService, CouponResolver],
  exports: [CouponService],
})
export class CouponModule {}
