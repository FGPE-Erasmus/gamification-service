import { Field, InputType } from '@nestjs/graphql';
import graphqlTypeJson from 'graphql-type-json';

import { Result } from '../models/result.enum';

@InputType()
export class ReportInput {
  @Field()
  result: Result;

  @Field(() => graphqlTypeJson, { nullable: true })
  metrics: Map<string, any>;

  @Field()
  feedback: string;

  @Field()
  grade: number;

  @Field()
  evaluatedAt: Date;
}
