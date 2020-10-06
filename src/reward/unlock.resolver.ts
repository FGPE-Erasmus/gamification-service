import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { UnlockDto } from './dto/unlock.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';

@Resolver(() => UnlockDto)
export class UnlockResolver extends RewardResolver {
  @Query(() => [UnlockDto])
  @UseGuards(GqlJwtAuthGuard)
  async unlocks(): Promise<UnlockDto[]> {
    return this.rewardService.findAll(RewardType.UNLOCK);
  }

  /*@ResolveField('challenges', () => [ChallengeDto])
  async challenges(@Parent() root: UnlockDto): Promise<ChallengeDto[]> {
    const { challenges } = root;
    if (!challenges || challenges.length === 0) {
      return [];
    }
    return await this.challengeService.findAll({
      id: { in: challenges.map(challenge => toMongoId(challenge)) },
    });
  }*/
}
