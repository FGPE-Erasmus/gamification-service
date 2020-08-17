import { Result } from '../entity/result.enum';
import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
export class EvaluationEvent {
  @Field()
  id: string;

  @Field()
  result: Result;

  @Field()
  //why do we need metrics here?
  metrics: { [key: string]: number };
}
