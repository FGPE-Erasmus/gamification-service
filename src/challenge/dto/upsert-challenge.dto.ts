import { Field, ArgsType } from '@nestjs/graphql';
import { MinLength, MaxLength, IsArray, IsEnum, IsBoolean } from 'class-validator';

import { ChallengeEntity as Challenge } from '../entities/challenge.entity';
import { Difficulty } from '../entities/difficulty.enum';
import { Mode } from '../entities/mode.enum';

@ArgsType()
export class UpsertChallengeDto {
  @Field()
  id: string;

  @Field(() => Challenge)
  parentChallenge: Challenge;

  @Field()
  @MinLength(4)
  @MaxLength(200)
  name: string;

  @Field()
  description: string;

  @Field()
  gameId: string;

  @Field(() => Difficulty)
  @IsEnum(Difficulty, { each: true })
  difficulty: Difficulty;

  @Field(() => Mode)
  @IsEnum(Mode, { each: true })
  mode: Mode;

  @Field(() => [String])
  @IsArray()
  modeParameters: string[];

  @Field(() => [String])
  @IsArray()
  refs: string[];

  @Field()
  @IsBoolean()
  locked: boolean;

  @Field()
  @IsBoolean()
  hidden: boolean;
}
