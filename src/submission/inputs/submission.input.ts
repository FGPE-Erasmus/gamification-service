import { Field, InputType } from '@nestjs/graphql';
import graphqlTypeJson from 'graphql-type-json';

import { Result } from '../models/result.enum';

@InputType()
export class SubmissionInput {
  @Field()
  game: string;

  @Field()
  player: string;

  @Field()
  exerciseId: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  metrics?: Map<string, any>;

  @Field(() => Result, { nullable: true })
  result?: Result;

  @Field({ nullable: true })
  grade?: number;

  @Field({ nullable: true })
  feedback?: string;

  @Field()
  submittedAt?: Date;

  @Field({ nullable: true })
  evaluatedAt?: Date;
}
