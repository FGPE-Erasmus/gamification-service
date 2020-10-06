import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { HintDto } from './dto/hint.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';

@Resolver(() => HintDto)
export class HintResolver extends RewardResolver {
  @Query(() => [HintDto])
  @UseGuards(GqlJwtAuthGuard)
  async hints(): Promise<HintDto[]> {
    return this.rewardService.findByKind(RewardType.HINT);
  }
}
