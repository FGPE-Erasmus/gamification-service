import { ObjectType, OmitType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('VirtualItem')
export class VirtualItemDto extends OmitType(RewardDto, ['kind', 'message', 'challenges']) {}
