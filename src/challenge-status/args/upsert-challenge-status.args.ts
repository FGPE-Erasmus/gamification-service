import { ArgsType, Field, ID } from '@nestjs/graphql';
import { Allow, IsMongoId, IsOptional, ValidateNested } from 'class-validator';

import { ChallengeStatusInput } from '../inputs/challenge-status.input';

@ArgsType()
export class UpsertChallengeArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @Field()
  @Allow()
  @ValidateNested()
  challengeStatusInput: ChallengeStatusInput;
}
