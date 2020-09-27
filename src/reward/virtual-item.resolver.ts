import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { VirtualItemDto } from './dto/virtual-item.dto';
import { RewardType } from './entities/reward-type.enum';
import { RewardResolver } from './reward.resolver';

@Resolver(() => VirtualItemDto)
export class VirtualItemResolver extends RewardResolver {
  @Query(() => [VirtualItemDto])
  @UseGuards(GqlJwtAuthGuard)
  async virtualItems(): Promise<VirtualItemDto[]> {
    return this.rewardService.findAll(RewardType.VIRTUAL_ITEM);
  }
}
