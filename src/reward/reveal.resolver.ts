import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { RevealDto } from './dto/reveal.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';

@Resolver(() => RevealDto)
export class RevealResolver extends RewardResolver {

  @Query(() => [RevealDto])
  @UseGuards(GqlJwtAuthGuard)
  async reveals(): Promise<RevealDto[]> {
    return this.rewardService.findByKind(RewardType.REVEAL);
  }

  /*@ResolveField('challenges', () => [ChallengeDto])
  async challenges(@Parent() root: RevealDto): Promise<ChallengeDto[]> {
    const { challenges } = root;
    if (!challenges || challenges.length === 0) {
      return [];
    }
    return await this.challengeService.findAll({
      id: { in: challenges.map(challenge => toMongoId(challenge)) },
    });
  }*/
}
