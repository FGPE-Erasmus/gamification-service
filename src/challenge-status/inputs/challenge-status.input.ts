import { Field, InputType } from '@nestjs/graphql';

import { StateEnum } from '../models/state.enum';

@InputType()
export class ChallengeStatusInput {
  @Field()
  player: string;

  @Field()
  challenge: string;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  openedAt?: Date;

  @Field({ nullable: true })
  endedAt?: Date;

  @Field(() => StateEnum)
  state: StateEnum;
}
