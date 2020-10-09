import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { MessageDto } from './dto/message.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';

@Resolver(() => MessageDto)
export class MessageResolver extends RewardResolver {
  @Query(() => [MessageDto])
  @UseGuards(GqlJwtAuthGuard)
  async messages(): Promise<MessageDto[]> {
    const rewards: Reward[] = await this.rewardService.findByKind(RewardType.MESSAGE);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }
}
