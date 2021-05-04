import { Field, ID, ObjectType } from '@nestjs/graphql';
import graphqlTypeJson from 'graphql-type-json';

import { GameDto } from '../../game/dto/game.dto';
import { PlayerDto } from '../../player/dto/player.dto';
import { EvaluationEngine } from '../models/evaluation-engine.enum';
import { Result } from '../models/result.enum';

@ObjectType('Validation')
export class ValidationDto {
  @Field(() => ID)
  id?: string;

  @Field(() => GameDto)
  game?: string;

  @Field(() => PlayerDto)
  player?: string;

  @Field()
  exerciseId?: string;

  @Field(() => EvaluationEngine, { nullable: true })
  evaluationEngine?: EvaluationEngine;

  @Field({ nullable: true })
  evaluationEngineId?: string;

  @Field({ nullable: true })
  language?: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  metrics?: Map<string, any>;

  @Field(() => graphqlTypeJson, { nullable: true })
  outputs?: { [k: string]: string };

  @Field(() => graphqlTypeJson, { nullable: true })
  userExecutionTimes?: { [k: string]: string };

  @Field(() => Result, { nullable: true })
  result?: Result;

  @Field({ nullable: true })
  feedback?: string;

  @Field()
  submittedAt?: Date;

  @Field({ nullable: true })
  evaluatedAt?: Date;

  @Field({ nullable: true })
  program?: string;

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
