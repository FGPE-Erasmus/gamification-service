import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class EvaluateInput {
  @Field()
  gameId: string;

  @Field()
  exerciseId: string;
}
