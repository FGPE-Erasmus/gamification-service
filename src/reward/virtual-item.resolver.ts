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
import { GqlPlayer } from '../common/decorators/gql-player.decorator';

@Resolver(() => VirtualItemDto)
export class VirtualItemResolver extends RewardResolver {
  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [VirtualItemDto])
  async virtualItems(@Args('gameId') gameId: string): Promise<VirtualItemDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.VIRTUAL_ITEM);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [VirtualItemDto])
  async playerVirtualItems(
    @Args('gameId') gameId: string,
    @GqlPlayer('id') playerId: string,
  ): Promise<VirtualItemDto[]> {
    const virtualItems: Reward[] = await this.rewardService.findByGameIdAndPlayerId(
      gameId,
      playerId,
      RewardType.VIRTUAL_ITEM,
    );
    return Promise.all(virtualItems.map(async virtualItem => this.rewardToDtoMapper.transform(virtualItem)));
  }
}
