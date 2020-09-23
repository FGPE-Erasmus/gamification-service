import { UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { ChallengeEntity as Challenge } from '../challenge/entities/challenge.entity';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { RevealDto } from './dto/reveal.dto';
import { RewardType } from './entities/reward-type.enum';
import { RewardResolver } from './reward.resolver';

@Resolver(() => RevealDto)
export class RevealResolver extends RewardResolver {
  @Query(() => [RevealDto])
  @UseGuards(GqlJwtAuthGuard)
  async reveals(): Promise<RevealDto[]> {
    return this.rewardService.findAll(RewardType.REVEAL);
  }

  @ResolveField('challenges', () => [Challenge])
  async challenges(@Parent() root: RevealDto): Promise<Challenge[]> {
    const { challenges } = root;
    if (!challenges || challenges.length === 0) {
      return [];
    }
    return await this.challengeService.findAll({
      id: { $in: challenges },
    });
  }
}
