import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { MessageDto } from './dto/message.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';

@Resolver(() => MessageDto)
export class MessageResolver extends RewardResolver {
  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [MessageDto])
  async messages(@Args('gameId') gameId: string): Promise<MessageDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.MESSAGE);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [MessageDto])
  async playerMessages(@Args('gameId') gameId: string, @GqlPlayer('id') playerId: string): Promise<MessageDto[]> {
    const messages: Reward[] = await this.rewardService.findByGameIdAndPlayerId(gameId, playerId, RewardType.MESSAGE);
    return Promise.all(messages.map(async message => this.rewardToDtoMapper.transform(message)));
  }
}
