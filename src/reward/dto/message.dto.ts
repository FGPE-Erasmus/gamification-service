import { Field, ObjectType } from '@nestjs/graphql';

import { RewardDto } from './reward.dto';

@ObjectType('Message')
export class MessageDto extends RewardDto {
  @Field()
  image?: string;

  @Field()
  message: string;
}
