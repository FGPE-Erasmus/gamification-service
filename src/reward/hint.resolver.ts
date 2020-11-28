import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { HintDto } from './dto/hint.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';

@Resolver(() => HintDto)
export class HintResolver extends RewardResolver {
  @Query(() => [HintDto])
  @UseGuards(GqlJwtAuthGuard)
  async hints(@Args('gameId') gameId: string): Promise<HintDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.HINT);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }
}
