import { Field, ObjectType } from '@nestjs/graphql';

import { Result } from '../../submission/models/result.enum';
import { PlayerDto } from './player.dto';
import graphqlTypeJson from 'graphql-type-json';

@ObjectType('PlayerStats')
export class PlayerStatsDto {
  @Field(() => PlayerDto)
  player?: string;

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
