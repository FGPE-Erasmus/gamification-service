import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { CouponDto } from './dto/coupon.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';

@Resolver(() => CouponDto)
export class CouponResolver extends RewardResolver {
  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [CouponDto])
  async coupons(@Args('gameId') gameId: string): Promise<CouponDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.COUPON);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }
}
