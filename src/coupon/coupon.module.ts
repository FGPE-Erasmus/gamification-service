import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponRepository } from './repository/coupon.repository';
import { CouponService } from './coupon.service';
import { CouponResolver } from './coupon.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([CouponRepository])],
  providers: [CouponService, CouponResolver],
  exports: [CouponService],
})
export class CouponModule {}
