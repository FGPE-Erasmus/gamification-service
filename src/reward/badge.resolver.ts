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

@Resolver(() => BadgeDto)
export class BadgeResolver extends RewardResolver {
  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [BadgeDto])
  async badges(@Args('gameId') gameId: string): Promise<BadgeDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.BADGE);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }
}
