import { ArgsType, Field, ID } from '@nestjs/graphql';
import { Allow, IsMongoId, ValidateNested } from 'class-validator';
import { ReportInput } from '../inputs/report.input';

@ArgsType()
export class SubmissionReportArgs {
  @Field(() => ID)
  @IsMongoId()
  id: string;

  @Field()
  @Allow()
  @ValidateNested()
  reportInput: ReportInput;
}
