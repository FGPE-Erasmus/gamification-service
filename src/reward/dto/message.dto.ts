import { ObjectType, OmitType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('Message')
export class MessageDto extends OmitType(RewardDto, ['kind', 'amount']) {}
