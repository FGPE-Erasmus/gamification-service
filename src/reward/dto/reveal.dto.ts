import { ObjectType, OmitType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('Reveal')
export class RevealDto extends OmitType(RewardDto, ['kind', 'image', 'amount', 'message']) {}
