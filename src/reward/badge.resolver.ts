import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { BadgeDto } from './dto/badge.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';

@Resolver(() => BadgeDto)
export class BadgeResolver extends RewardResolver {

  @Query(() => [BadgeDto])
  @UseGuards(GqlJwtAuthGuard)
  async badges(): Promise<BadgeDto[]> {
    return this.rewardService.findByKind(RewardType.BADGE);
  }
}
