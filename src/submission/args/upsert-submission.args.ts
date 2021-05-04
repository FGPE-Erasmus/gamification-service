import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsMongoId, IsOptional, ValidateNested } from 'class-validator';

import { SubmissionInput } from '../inputs/submission.input';

@ArgsType()
export class UpsertSubmissionArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @Field()
  @ValidateNested()
  submissionInput: SubmissionInput;
}
