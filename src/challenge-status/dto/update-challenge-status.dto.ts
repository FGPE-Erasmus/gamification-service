import { Field, ArgsType } from '@nestjs/graphql';
import { State } from '../entities/state.enum';

@ArgsType()
export default class UpdateChallengeStatus {
  @Field()
  studentId: string;

  @Field()
  challengeId: string;

  @Field(() => [State])
  state: State[];

  @Field()
  date: Date;
}
