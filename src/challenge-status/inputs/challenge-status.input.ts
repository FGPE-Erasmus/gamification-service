import { Field, InputType } from '@nestjs/graphql';

import { State } from '../models/state.enum';

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

  @Field(() => State)
  state: State;
}
