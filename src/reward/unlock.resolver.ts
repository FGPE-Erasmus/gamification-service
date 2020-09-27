import { UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { ChallengeEntity as Challenge } from '../challenge/entities/challenge.entity';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { UnlockDto } from './dto/unlock.dto';
import { RewardType } from './entities/reward-type.enum';
import { RewardResolver } from './reward.resolver';

@Resolver(() => UnlockDto)
export class UnlockResolver extends RewardResolver {
  @Query(() => [UnlockDto])
  @UseGuards(GqlJwtAuthGuard)
  async unlocks(): Promise<UnlockDto[]> {
    return this.rewardService.findAll(RewardType.UNLOCK);
  }

  @ResolveField('challenges', () => [Challenge])
  async challenges(@Parent() root: UnlockDto): Promise<Challenge[]> {
    const { challenges } = root;
    if (!challenges || challenges.length === 0) {
      return [];
    }
    return await this.challengeService.findAll({
      id: { $in: challenges },
    });
  }
}
