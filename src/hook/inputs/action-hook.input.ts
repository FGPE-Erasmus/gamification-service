import { Field, ID, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { TriggerEventEnum as TriggerEvent } from '../enums/trigger-event.enum';
import { ActionInput as Action } from './action.input';
import { CriteriaInput as Criteria } from './criteria.input';

@InputType()
export class ActionHookInput {
  @Field(() => ID)
  @IsOptional()
  @IsString()
  id?: string;

  @Field()
  @IsString()
  game: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  parentChallenge?: string;

  @Field(() => TriggerEvent)
  @IsEnum(TriggerEvent)
  trigger: TriggerEvent;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @Field(() => Criteria, { nullable: true })
  @IsOptional()
  @ValidateNested()
  criteria?: Criteria;

  @Field(() => [Action])
  @IsArray()
  @ValidateNested({ each: true })
  actions: Action[];

  @Field()
  @IsBoolean()
  recurrent: boolean;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
