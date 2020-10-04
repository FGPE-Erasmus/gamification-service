import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SendSubmissionInput {

  @Field()
  id: string;

  @Field()
  game: string;

  @Field()
  player: string;

  @Field()
  exerciseId: string;

  @Field()
  codeFile: string;
}
