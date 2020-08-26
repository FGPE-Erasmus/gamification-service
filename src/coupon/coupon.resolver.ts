import { CouponService } from './coupon.service';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { CouponEntity as Coupon } from './entities/coupon.entity';
import { GqlUser } from 'src/common/decorators/gql-user.decorator';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from 'src/common/guards/gql-jwt-auth.guard';
import { GqlEnrolledInGame } from 'src/common/guards/gql-game-enrollment.guard';

@Resolver()
export class CouponResolver {
  constructor(readonly couponService: CouponService) {}

  @Query(() => [Player])
  @UseGuards(GqlJwtAuthGuard, GqlEnrolledInGame)
  async playersWithCoupon(@Args('couponId') id: string): Promise<Player[]> {
    return await this.couponService.getPlayersWithCoupon(id);
  }

  @Query(() => [Coupon])
  @UseGuards(GqlJwtAuthGuard, GqlEnrolledInGame)
  async coupons(@GqlUser('id') playerId: string): Promise<Coupon[]> {
    return await this.couponService.getCoupons(playerId);
  }

  @Query(() => [Coupon])
  @UseGuards(GqlJwtAuthGuard, GqlEnrolledInGame)
  async coupon(@Args('couponId') id: string, @GqlUser('id') playerId: string): Promise<Coupon[]> {
    return await this.couponService.getCoupon(id, playerId);
  }
}
