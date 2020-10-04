import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';

import { JunctorEnum as Junctor } from '../enums/junctor.enum';
import { ConditionInput as Condition } from './condition.input';

@InputType()
export class CriteriaInput {
  @Field(() => [Condition], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  conditions: Condition[];

  @Field(() => [Junctor], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(Junctor, { each: true })
  junctors: Junctor[];
}
