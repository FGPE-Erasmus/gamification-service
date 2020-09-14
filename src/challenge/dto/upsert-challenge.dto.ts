import { Field, ArgsType } from '@nestjs/graphql';
import { MinLength, MaxLength, IsArray, IsEnum } from 'class-validator';
import { Difficulty } from '../entities/difficulty.enum';
import { Mode } from '../entities/mode.enum';
import { ChallengeEntity as Challenge } from '../entities/challenge.entity';

@ArgsType()
export class UpsertChallengeDto {
  @Field()
  id: string;

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
  locked: boolean;

  @Field()
  hidden: boolean;

  @Field(() => [Challenge])
  @IsArray()
  children: Challenge[];
}
