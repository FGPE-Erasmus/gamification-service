import { Field, ID, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';

import { ActionInput as Action } from './action.input';
import { CriteriaInput as Criteria } from './criteria.input';

@InputType()
export class ScheduledHookInput {
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

  @Field(() => Criteria, { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  criteria?: Criteria;

  @Field(() => [Action])
  @IsArray()
  @ValidateNested({ each: true })
  actions: Action[];

  @Field({ nullable: true })
  @ValidateIf(obj => !obj.interval)
  @IsString()
  cron?: string;

  @Field({ nullable: true })
  @ValidateIf(obj => !obj.cron)
  @IsNumber()
  interval?: number;

  @Field()
  @IsBoolean()
  recurrent: boolean;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
