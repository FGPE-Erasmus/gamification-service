import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { CouponDto } from './dto/coupon.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';

@Resolver(() => CouponDto)
export class CouponResolver extends RewardResolver {
  @Query(() => [CouponDto])
  @UseGuards(GqlJwtAuthGuard)
  async coupons(): Promise<CouponDto[]> {
    const rewards: Reward[] = await this.rewardService.findByKind(RewardType.COUPON);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }
}
