import { Field } from '@nestjs/graphql';
import graphqlTypeJson from 'graphql-type-json';

import { EvaluationEngine } from '../../submission/models/evaluation-engine.enum';
import { Result } from '../../submission/models/result.enum';

export class ValidationDto {
  @Field(() => EvaluationEngine, { nullable: true })
  evaluationEngine?: EvaluationEngine;

  @Field({ nullable: true })
  evaluationEngineId?: string;

  @Field({ nullable: true })
  language?: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  metrics?: Map<string, number>;

  @Field(() => graphqlTypeJson, { nullable: true })
  outputs?: { [k: string]: string };

  @Field(() => graphqlTypeJson, { nullable: true })
  userExecutionTimes?: { [k: string]: string };

  @Field(() => Result, { nullable: true })
  result?: Result;

  @Field({ nullable: true })
  feedback?: string;

  @Field({ nullable: true })
  evaluatedAt?: Date;
}
