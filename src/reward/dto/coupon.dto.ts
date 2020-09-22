import { Field, ObjectType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('Coupon')
export class CouponDto extends RewardDto {
  @Field()
  image?: string;

  @Field()
  amount?: number;
}
