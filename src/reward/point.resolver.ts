import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { PointDto } from './dto/point.dto';
import { RewardType } from './entities/reward-type.enum';
import { RewardResolver } from './reward.resolver';

@Resolver(() => PointDto)
export class PointResolver extends RewardResolver {
  @Query(() => [PointDto])
  @UseGuards(GqlJwtAuthGuard)
  async points(): Promise<PointDto[]> {
    return this.rewardService.findAll(RewardType.POINT);
  }
}
