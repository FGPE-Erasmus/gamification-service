import { ID, Field, ArgsType } from '@nestjs/graphql';
import { IsOptional, IsMongoId, Allow, ValidateNested } from 'class-validator';

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
