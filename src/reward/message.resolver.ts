import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { MessageDto } from './dto/message.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { Challenge } from '../challenge/models/challenge.model';
import { toString } from '../common/utils/mongo.utils';

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
  async playerMessages(
    @Args('gameId') gameId: string,
    @GqlPlayer('id') playerId: string,
    @Args('challengeId') challengeId?: string,
  ): Promise<MessageDto[]> {
    let messages: Reward[] = await this.rewardService.findByGameIdAndPlayerId(gameId, playerId, RewardType.MESSAGE);
    if (challengeId) {
      messages = messages.filter(
        message =>
          message.challenges && message.challenges.findIndex(challenge => toString(challenge) === challengeId) >= 0,
      );
    }
    return Promise.all(messages.map(async message => this.rewardToDtoMapper.transform(message)));
  }

  @ResolveField('challenges', () => [ChallengeDto])
  async challenges(@Parent() root: MessageDto): Promise<ChallengeDto[]> {
    const { challenges: challengeIds } = root;
    if (!challengeIds || challengeIds.length === 0) {
      return [];
    }
    const challenges: Challenge[] = await this.challengeService.findAll({
      _id: { $in: challengeIds },
    });
    return Promise.all(challenges.map(async challenge => this.challengeToDtoMapper.transform(challenge)));
  }
}
