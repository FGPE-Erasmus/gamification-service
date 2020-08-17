import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@ArgsType()
export class SubmissionDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  id?: string;

  @Field()
  exerciseId: string;

  @Field()
  playerId: string;

  @Field()
  metrics: { [key: string]: number };

  @Field()
  submittedAt: Date;
}
