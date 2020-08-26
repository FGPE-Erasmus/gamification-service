import { Field, ArgsType } from '@nestjs/graphql';
import { MinLength, MaxLength, IsArray, IsEnum } from 'class-validator';
import { Difficulty } from '../entities/difficulty.enum';
import { Mode } from '../entities/mode.enum';

@ArgsType()
export class UpsertChallengeDto {
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

  @Field({ nullable: true })
  @IsArray()
  modeParameters: string[];

  @Field({ nullable: true })
  exerciseIds: string[];

  @Field()
  locked: boolean;

  @Field()
  hidden: boolean;
}
