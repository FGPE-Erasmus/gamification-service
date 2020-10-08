import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { VirtualItemDto } from './dto/virtual-item.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';

@Resolver(() => VirtualItemDto)
export class VirtualItemResolver extends RewardResolver {
  @Query(() => [VirtualItemDto])
  @UseGuards(GqlJwtAuthGuard)
  async virtualItems(): Promise<VirtualItemDto[]> {
    const rewards: Reward[] = await this.rewardService.findByKind(RewardType.VIRTUAL_ITEM);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }
}