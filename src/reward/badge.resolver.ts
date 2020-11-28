import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { BadgeDto } from './dto/badge.dto';
import { Reward } from './models/reward.model';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';

@Resolver(() => BadgeDto)
export class BadgeResolver extends RewardResolver {
  @Query(() => [BadgeDto])
  @UseGuards(GqlJwtAuthGuard)
  async badges(@Args('gameId') gameId: string): Promise<BadgeDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.BADGE);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }
}
