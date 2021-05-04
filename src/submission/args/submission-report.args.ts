import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsMongoId, ValidateNested } from 'class-validator';
import { ReportInput } from '../inputs/report.input';

@ArgsType()
export class SubmissionReportArgs {
  @Field(() => ID)
  @IsMongoId()
  @Field()
  @ValidateNested()
  reportInput: ReportInput;
}
