import { ObjectType, Field, ID } from '@nestjs/graphql';

import { PlayerDto } from '../../player/dto/player.dto';
import { RewardDto } from '../../reward/dto/reward.dto';

@ObjectType('PlayerReward')
export class PlayerRewardDto {
  @Field(() => ID)
  id?: string;

  @Field(() => PlayerDto)
  player?: string;

  @Field(() => RewardDto)
  reward?: string;

  @Field()
  count?: number;
}
