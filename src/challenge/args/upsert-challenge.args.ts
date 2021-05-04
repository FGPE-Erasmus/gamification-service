import { ArgsType, Field, ID } from '@nestjs/graphql';
import { Allow, IsMongoId, IsOptional, ValidateNested } from 'class-validator';

import { ChallengeInput } from '../inputs/challenge.input';

@ArgsType()
export class UpsertChallengeArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @Field()
  @Allow()
  @ValidateNested()
  challengeInput: ChallengeInput;
}
