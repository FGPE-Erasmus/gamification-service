import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { Difficulty } from '../entities/difficulty.enum';
import { Mode } from '../entities/mode.enum';
import { MinLength, MaxLength, IsArray, IsEnum } from 'class-validator';

@InputType('CreateChallengeInput')
export class CreateChallengeDto {
  @Field()
  @MinLength(4)
  @MaxLength(200)
  name: string;

  @Field()
  description: string;

  @Field(() => [Difficulty])
  @IsArray()
  @IsEnum(Difficulty, { each: true })
  difficulty: Difficulty[];

  @Field(() => [Mode])
  @IsArray()
  @IsEnum(Mode, { each: true })
  mode: Mode[];

  @Field({ nullable: true }) //If its something else than HACK_IT, SHAPESHIFTER, TIME_BOMB, SPEEDUP, SHORTENING - is it empty then?
  @IsArray()
  modeParameters: string[]; //switch-case depending on mode?

  @Field({ nullable: true })
  exerciseIds: string[];
  startedAt: Date;
}
