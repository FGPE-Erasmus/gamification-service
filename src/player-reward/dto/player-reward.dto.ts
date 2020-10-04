import { ObjectType, Field, ID } from '@nestjs/graphql';

import { PlayerDto } from '../../player/dto/player.dto';
import { RewardDto } from '../../reward/dto/reward.dto';

@ObjectType('PlayerReward')
export class PlayerRewardDto {

  @Field(() => ID)
  id: string;

  @Field(() => PlayerDto)
  player: PlayerDto;

  @Field(() => RewardDto)
  reward: RewardDto;

  @Field()
  count: number;
}
