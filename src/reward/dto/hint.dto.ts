import { ObjectType, OmitType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('Hint')
export class HintDto extends OmitType(RewardDto, ['kind', 'amount']) {}
