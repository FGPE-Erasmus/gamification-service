import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { CouponDto } from './dto/coupon.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';

@Resolver(() => CouponDto)
export class CouponResolver extends RewardResolver {
  @Query(() => [CouponDto])
  @UseGuards(GqlJwtAuthGuard)
  async coupons(): Promise<CouponDto[]> {
    return this.rewardService.findByKind(RewardType.COUPON);
  }
}
