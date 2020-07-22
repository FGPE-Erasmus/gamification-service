import { ObjectType, Field, ArgsType, InputType } from '@nestjs/graphql';
import { State } from './state.enum';

@ObjectType('ChallengeStatus')
export default class ChallengeStatus {
  @Field()
  startedAt: Date;

  @Field({ nullable: true })
  endedAt?: Date;

  @Field(() => [State])
  state: [State];

  @Field({ nullable: true })
  openedAt?: Date;
}
