import { Field, ArgsType, InputType } from '@nestjs/graphql';
import { State } from '../entities/state.enum';

@ArgsType()
export default class ChallengeStatusDto {
  @Field()
  startedAt: Date;

  @Field({ nullable: true })
  endedAt?: Date;

  @Field(() => [State])
  state: State[];

  @Field({ nullable: true })
  openedAt?: Date;
}
