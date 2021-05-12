import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Role } from '../common/enums/role.enum';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { HintDto } from './dto/hint.dto';
import { Reward } from './models/reward.model';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { UseGuards } from '@nestjs/common';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { Challenge } from '../challenge/models/challenge.model';
import { toString } from '../common/utils/mongo.utils';

@Resolver(() => HintDto)
export class HintResolver extends RewardResolver {
  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [HintDto])
  async hints(@Args('gameId') gameId: string): Promise<HintDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.HINT);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [HintDto])
  async playerHints(
    @Args('gameId') gameId: string,
    @GqlPlayer('id') playerId: string,
    @Args('challengeId') challengeId?: string,
  ): Promise<HintDto[]> {
    let hints: Reward[] = await this.rewardService.findByGameIdAndPlayerId(gameId, playerId, RewardType.HINT);
    if (challengeId) {
      hints = hints.filter(
        hint => hint.challenges && hint.challenges.findIndex(challenge => toString(challenge) === challengeId) >= 0,
      );
    }
    return Promise.all(hints.map(async hint => this.rewardToDtoMapper.transform(hint)));
  }

  @ResolveField('challenges', () => [ChallengeDto])
  async challenges(@Parent() root: HintDto): Promise<ChallengeDto[]> {
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
