import { CouponService } from './coupon.service';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { CouponEntity as Coupon } from './entities/coupon.entity';
import { GqlUser } from 'src/common/decorators/gql-user.decorator';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';

@Resolver()
export class CouponResolver {
  constructor(readonly couponService: CouponService) {}

  @Query(() => [Player])
  async playersWithCoupon(@Args('rewardId') id: string): Promise<Player[]> {
    return await this.couponService.getPlayersWithCoupon(id);
  }

  @Query(() => [Coupon])
  async coupons(@GqlUser('id') playerId: string): Promise<Coupon[]> {
    return await this.couponService.getCoupons(playerId);
  }

  @Query(() => [Coupon])
  async coupon(@Args('rewardId') id: string, @GqlUser('id') playerId: string): Promise<Coupon[]> {
    return await this.couponService.getCoupon(id, playerId);
  }
}
