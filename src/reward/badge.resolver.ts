import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { BadgeDto } from './dto/badge.dto';
import { Reward } from './models/reward.model';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';

@Resolver(() => BadgeDto)
export class BadgeResolver extends RewardResolver {
  @Query(() => [BadgeDto])
  @UseGuards(GqlJwtAuthGuard)
  async badges(): Promise<BadgeDto[]> {
    const rewards: Reward[] = await this.rewardService.findByKind(RewardType.BADGE);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }
}
