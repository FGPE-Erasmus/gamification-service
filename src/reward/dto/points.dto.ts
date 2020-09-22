import { Field, ObjectType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('Points')
export class PointsDto extends RewardDto {
  @Field()
  amount: number;
}
