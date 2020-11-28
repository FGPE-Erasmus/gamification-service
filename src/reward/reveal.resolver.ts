import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { RevealDto } from './dto/reveal.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { Challenge } from '../challenge/models/challenge.model';
import { Reward } from './models/reward.model';

@Resolver(() => RevealDto)
export class RevealResolver extends RewardResolver {
  @Query(() => [RevealDto])
  @UseGuards(GqlJwtAuthGuard)
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
}
