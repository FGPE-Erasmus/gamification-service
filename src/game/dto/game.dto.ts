import { Field, ArgsType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { MinLength, MaxLength, IsString, IsOptional, IsArray, IsDate } from 'class-validator';

@ArgsType()
export default class GameDto {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(1000)
  description?: string;

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

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  users?: string[];
}
