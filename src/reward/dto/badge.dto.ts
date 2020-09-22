import { Field, ObjectType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('Badge')
export class BadgeDto extends RewardDto {
  @Field()
  image?: string;
}
