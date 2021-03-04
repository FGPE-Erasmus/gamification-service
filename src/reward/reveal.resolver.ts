import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Role } from '../common/enums/role.enum';
import { Challenge } from '../challenge/models/challenge.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { RevealDto } from './dto/reveal.dto';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';
import { UseGuards } from '@nestjs/common';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { PlayerReward } from '../player-reward/models/player-reward.model';

@Resolver(() => RevealDto)
export class RevealResolver extends RewardResolver {
  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [RevealDto])
  async reveals(@Args('gameId') gameId: string): Promise<RevealDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.REVEAL);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }

  @ResolveField('challenges', () => [ChallengeDto])
  async challenges(@Parent() root: RevealDto): Promise<ChallengeDto[]> {
    const { challenges: challengeIds } = root;
    if (!challengeIds || challengeIds.length === 0) {
      return [];
    }
    const challenges: Challenge[] = await this.challengeService.findAll({
      _id: { $in: challengeIds },
    });
    return Promise.all(challenges.map(async challenge => this.challengeToDtoMapper.transform(challenge)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [RevealDto])
  async playerReveals(@Args('gameId') gameId: string, @GqlPlayer('id') playerId: string): Promise<RevealDto[]> {
    const reveals: Reward[] = await this.rewardService.findByGameIdAndPlayerId(gameId, playerId, RewardType.REVEAL);
    return Promise.all(reveals.map(async reveal => this.rewardToDtoMapper.transform(reveal)));
  }
}
