import { Field, InputType } from '@nestjs/graphql';
import { MinLength, MaxLength, IsArray, IsEnum, IsBoolean, IsMongoId, IsUUID, IsOptional } from 'class-validator';

import { Difficulty } from '../models/difficulty.enum';
import { Mode } from '../models/mode.enum';

@InputType()
export class ChallengeInput {
  @Field()
  @IsMongoId()
  game: string;

  @Field()
  @IsOptional()
  @IsMongoId()
  parentChallenge?: string;

  @Field()
  @MinLength(4)
  @MaxLength(200)
  name: string;

  @Field()
  @MaxLength(1000)
  description: string;

  @Field(() => Difficulty)
  @IsOptional()
  @IsEnum(Difficulty, { each: true })
  difficulty?: Difficulty;

  @Field(() => Mode)
  @IsOptional()
  @IsEnum(Mode, { each: true })
  mode?: Mode;

  @Field(() => [String])
  @IsOptional()
  @IsArray()
  modeParameters?: string[];

  @Field(() => [String])
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  refs?: string[];

  @Field()
  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @Field()
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
