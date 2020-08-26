import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SubmissionDto {
  @Field()
  id: string;

  @Field()
  gameId: string;

  @Field()
  exerciseId: string;

  @Field()
  playerId: string;

  @Field()
  codeFile: string;
}
