import { ObjectType, OmitType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('Coupon')
export class CouponDto extends OmitType(RewardDto, ['kind', 'message', 'challenges']) {}
