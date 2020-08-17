import { ArgsType, Field } from '@nestjs/graphql';
import { Result } from '../entity/result.enum';

@ArgsType()
export class SubmissionDto {
  @Field()
  id: string;

  @Field()
  exerciseId: string;

  @Field()
  playerId: string;

  @Field()
  metrics: { [key: string]: number };

  @Field(() => Result, { nullable: true })
  result?: Result;

  @Field({ nullable: true })
  grade?: number;

  @Field({ nullable: true })
  feedback?: string;

  @Field()
  submittedAt: Date;

  @Field({ nullable: true })
  evaluatedAt?: Date;
}
