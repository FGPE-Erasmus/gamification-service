import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SubmissionDto {
  @Field()
  id: string;

  @Field()
  exerciseId: string;

  @Field()
  playerId: string;
}
