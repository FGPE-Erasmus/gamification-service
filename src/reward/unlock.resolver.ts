import { UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { Challenge } from '../challenge/models/challenge.model';
import { UnlockDto } from './dto/unlock.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';
import { ChallengeDto } from '../challenge/dto/challenge.dto';

@Resolver(() => UnlockDto)
export class UnlockResolver extends RewardResolver {
  @Query(() => [UnlockDto])
  @UseGuards(GqlJwtAuthGuard)
  async unlocks(): Promise<UnlockDto[]> {
    const rewards: Reward[] = await this.rewardService.findByKind(RewardType.UNLOCK);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }

  @ResolveField('challenges', () => [ChallengeDto])
  async challenges(@Parent() root: UnlockDto): Promise<ChallengeDto[]> {
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
