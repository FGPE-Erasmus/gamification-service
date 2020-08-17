import { Result } from '../entity/result.enum';
import { Field, ArgsType, ID } from '@nestjs/graphql';
import { ObjectID } from 'typeorm';

@ArgsType()
export class EvaluationEvent {
  @Field(() => ID)
  id: ObjectID;

  @Field()
  result: Result;

  @Field()
  metrics: { [key: string]: number };

  @Field()
  feedback: string;

  @Field()
  grade: number;

  @Field()
  evaluatedAt: Date;
}
