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
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { PlayerReward } from '../player-reward/models/player-reward.model';

@Resolver(() => CouponDto)
export class CouponResolver extends RewardResolver {
  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [CouponDto])
  async coupons(@Args('gameId') gameId: string): Promise<CouponDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.COUPON);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [CouponDto])
  async playerCoupons(@Args('gameId') gameId: string, @GqlPlayer('id') playerId: string): Promise<CouponDto[]> {
    const gameCoupons: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.COUPON);
    const playerCoupons: PlayerReward[] = await this.playerRewardService.findAll({
      player: { $eq: playerId },
    });
    const coupons: Reward[] = gameCoupons.filter(coupon1 =>
      playerCoupons.some(coupon2 => coupon1.id === coupon2.reward),
    );
    return Promise.all(coupons.map(async coupon => this.rewardToDtoMapper.transform(coupon)));
  }
}
