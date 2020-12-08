import { Args, Query, Resolver } from '@nestjs/graphql';

import { VirtualItemDto } from './dto/virtual-item.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UseGuards } from '@nestjs/common';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';

@Resolver(() => VirtualItemDto)
export class VirtualItemResolver extends RewardResolver {
  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [VirtualItemDto])
  async virtualItems(@Args('gameId') gameId: string): Promise<VirtualItemDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.VIRTUAL_ITEM);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }
}
