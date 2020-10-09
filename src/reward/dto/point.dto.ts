import { ObjectType, OmitType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('Point')
export class PointDto extends OmitType(RewardDto, ['kind', 'image', 'cost', 'message', 'challenges']) {}
