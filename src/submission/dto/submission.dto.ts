import { Field, ObjectType, ID } from '@nestjs/graphql';
import graphqlTypeJson from 'graphql-type-json';

import { GameDto } from '../../game/dto/game.dto';
import { PlayerDto } from '../../player/dto/player.dto';
import { Result } from '../models/result.enum';

@ObjectType('Submission')
export class SubmissionDto {
  @Field(() => ID)
  id?: string;

  @Field(() => GameDto)
  game?: GameDto;

  @Field(() => PlayerDto)
  player?: PlayerDto;

  @Field()
  exerciseId?: string;

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
