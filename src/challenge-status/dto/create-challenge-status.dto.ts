import { ObjectType, Field, ArgsType, InputType } from '@nestjs/graphql';
import { State } from './state.enum';

/**
 * State of a student towards a challenge.
 * Created as soon as there is an interaction between
 * the student and the challenge.
 */

//Im not quite sure if this class is needed when creating a status. I assume that when its created endedAt, openedAt are empty/undefined,
//state has some default value and startedAt would be basically new Date() at the moment of creation? Let me know how you feel about that

@InputType('CreateStatusInput')
export default class CreateStatusDto {
  @Field()
  startedAt: Date;

  @Field({ nullable: true })
  endedAt?: Date;

  @Field(() => [State])
  state: [State];

  @Field({ nullable: true })
  openedAt?: Date;
}
