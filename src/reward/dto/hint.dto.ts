import { Field, ObjectType } from '@nestjs/graphql';

import { ChallengeEntity as Challenge } from '../../challenge/entities/challenge.entity';
import { RewardDto } from './reward.dto';

@ObjectType('Hints')
export class HintsDto extends RewardDto {
  @Field()
  image?: string;

  @Field()
  message: string;

  @Field(() => [Challenge])
  challenges?: Challenge[];
}
