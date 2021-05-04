import { ObjectType, OmitType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('Unlock')
export class UnlockDto extends OmitType(RewardDto, ['kind', 'image', 'amount', 'message']) {}
