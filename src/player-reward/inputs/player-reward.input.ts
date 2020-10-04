import { Field, InputType} from '@nestjs/graphql';

@InputType()
export class PlayerRewardInput {

  @Field()
  playerId: string;

  @Field()
  rewardId: string;

}
