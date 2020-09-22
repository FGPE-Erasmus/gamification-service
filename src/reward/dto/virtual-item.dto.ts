import { Field, ObjectType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('VirtualItem')
export class VirtualItemDto extends RewardDto {
  @Field()
  image?: string;

  @Field()
  amount?: number;
}
