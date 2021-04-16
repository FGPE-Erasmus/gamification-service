import { Field, ObjectType } from '@nestjs/graphql';

import { Result } from '../../submission/models/result.enum';
import { GameDto } from '../../game/dto/game.dto';
import graphqlTypeJson from 'graphql-type-json';

@ObjectType('Stats')
export class StatsDto {
  @Field(() => GameDto)
  game?: string;

  @Field({ defaultValue: 0 })
  nrOfSubmissions?: number;

  @Field({ defaultValue: 0 })
  nrOfValidations?: number;

  @Field(() => graphqlTypeJson, { nullable: true })
  nrOfSubmissionsByActivity?: Record<string, number>;

  @Field(() => graphqlTypeJson, { nullable: true })
  nrOfValidationsByActivity?: Record<string, number>;

  @Field(() => graphqlTypeJson, { nullable: true })
  nrOfSubmissionsByActivityAndResult?: Record<string, Record<Result, number>>;

  @Field(() => graphqlTypeJson, { nullable: true })
  nrOfValidationsByActivityAndResult?: Record<string, Record<Result, number>>;
}
