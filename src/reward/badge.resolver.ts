import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { Role } from '../common/enums/role.enum';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { BadgeDto } from './dto/badge.dto';
import { Reward } from './models/reward.model';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { PlayerReward } from '../player-reward/models/player-reward.model';

@Resolver(() => BadgeDto)
export class BadgeResolver extends RewardResolver {
  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [BadgeDto])
  async badges(@Args('gameId') gameId: string): Promise<BadgeDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.BADGE);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [BadgeDto])
  async playerBadges(@Args('gameId') gameId: string, @GqlPlayer('id') playerId: string): Promise<BadgeDto[]> {
    const badges: Reward[] = await this.rewardService.findByGameIdAndPlayerId(gameId, playerId, RewardType.BADGE);
    return Promise.all(badges.map(async badge => this.rewardToDtoMapper.transform(badge)));
  }
}
