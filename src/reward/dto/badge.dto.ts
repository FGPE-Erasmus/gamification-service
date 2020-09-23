import { ObjectType, OmitType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('Badge')
export class BadgeDto extends OmitType(RewardDto, ['kind', 'amount', 'message', 'challenges']) {}
