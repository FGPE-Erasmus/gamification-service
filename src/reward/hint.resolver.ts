import { Args, Query, Resolver } from '@nestjs/graphql';

import { Role } from '../common/enums/role.enum';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { HintDto } from './dto/hint.dto';
import { Reward } from './models/reward.model';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { UseGuards } from '@nestjs/common';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';

@Resolver(() => HintDto)
export class HintResolver extends RewardResolver {
  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [HintDto])
  async hints(@Args('gameId') gameId: string): Promise<HintDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.HINT);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }
}
