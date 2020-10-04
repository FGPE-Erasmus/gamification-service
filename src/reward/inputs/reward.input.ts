import { Field, InputType} from '@nestjs/graphql';

import { RewardType } from '../models/reward-type.enum';

@InputType()
export class RewardInput {

  @Field()
  game: string;

  @Field({ nullable: true })
  parentChallenge?: string;

  @Field(() => RewardType)
  kind: RewardType;

  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  image?: string;

  @Field()
  recurrent: boolean;

  @Field({ nullable: true })
  cost?: number;

  @Field({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  challenges?: string[];

  @Field({ nullable: true })
  players?: string[];

}
