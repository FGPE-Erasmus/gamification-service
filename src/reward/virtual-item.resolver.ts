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
import { PlayerReward } from '../player-reward/models/player-reward.model';

@Resolver(() => VirtualItemDto)
export class VirtualItemResolver extends RewardResolver {
  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
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
    const gameVirtualItems: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.VIRTUAL_ITEM);
    const playerVirtualItems: PlayerReward[] = await this.playerRewardService.findAll({
      player: { $eq: playerId },
    });
    const virtualItems: Reward[] = gameVirtualItems.filter(virtualItem1 =>
      playerVirtualItems.some(virtualItem2 => virtualItem1.id === virtualItem2.reward),
    );
    return Promise.all(virtualItems.map(async VirtualItem => this.rewardToDtoMapper.transform(VirtualItem)));
  }
}
