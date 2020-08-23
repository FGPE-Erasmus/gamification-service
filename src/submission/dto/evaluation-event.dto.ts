import { Result } from '../entities/result.enum';
import { Field, ArgsType, ID } from '@nestjs/graphql';
import { ObjectID } from 'typeorm';
import graphqlTypeJson from 'graphql-type-json';

@ArgsType()
export class EvaluationEvent {
  @Field(() => ID)
  id: ObjectID;

  @Field()
  result: Result;

  @Field(() => graphqlTypeJson, { nullable: true })
  metrics: { [key: string]: number };

  @Field()
  feedback: string;

  @Field()
  grade: number;

  @Field()
  evaluatedAt: Date;
}
