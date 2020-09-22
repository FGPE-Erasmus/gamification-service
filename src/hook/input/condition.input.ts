import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsString } from 'class-validator';

import { ComparingFunctionEnum as ComparingFunction } from '../enum/comparing-function.enum';
import { EntityEnum as Entity } from '../enum/entity.enum';

@InputType()
export class ConditionInput {
  @Field()
  @IsNumber()
  order: number;

  @Field(() => Entity)
  @IsEnum(Entity)
  leftEntity: Entity;

  @Field()
  @IsString()
  leftProperty: string;

  @Field(() => ComparingFunction)
  @IsEnum(ComparingFunction)
  comparingFunction: ComparingFunction;

  @Field(() => Entity)
  @IsEnum(Entity)
  rightEntity: Entity;

  @Field()
  @IsString()
  rightProperty: string;
}
