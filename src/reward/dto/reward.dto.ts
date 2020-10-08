import { Field, ID, ObjectType } from '@nestjs/graphql';

import { RewardType } from '../models/reward-type.enum';
import { ChallengeDto } from '../../challenge/dto/challenge.dto';
import { GameDto } from '../../game/dto/game.dto';
import { PlayerRewardDto } from '../../player-reward/dto/player-reward.dto';

@ObjectType('Reward')
export class RewardDto {
  @Field(() => ID)
  id?: string;

  @Field(() => GameDto)
  game?: string;

  @Field(() => ChallengeDto, { nullable: true })
  parentChallenge?: string;

  @Field(() => RewardType)
  kind?: RewardType;

  @Field()
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  image?: string;

  @Field()
  recurrent?: boolean;

  @Field({ nullable: true })
  cost?: number;

  @Field({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  message?: string;

  @Field(() => [ChallengeDto], { nullable: true })
  challenges?: string[];

  @Field(() => [PlayerRewardDto])
  players?: string[];

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
