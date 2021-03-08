import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { MinLength, MaxLength, IsString, IsOptional, IsDate, IsUUID, IsEnum, Matches } from 'class-validator';
import { EvaluationEngine } from '../../submission/models/evaluation-engine.enum';

@InputType()
export class GameInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/[a-zA-Z0-9_-]+/)
  courseId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID(4)
  gedilLayerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(1000)
  gedilLayerDescription?: string;

  @Field({ nullable: true })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field({ nullable: true })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field(() => EvaluationEngine, { nullable: true })
  @IsOptional()
  @IsEnum(EvaluationEngine)
  evaluationEngine?: EvaluationEngine;
}
