import { Field, ArgsType } from '@nestjs/graphql';
import { IsArray } from 'class-validator';

import { Criteria } from 'src/hook/other-dto/criteria.dto';
import { Action } from 'src/hook/other-dto/action.dto';
import { Trigger } from './trigger.dto';

@ArgsType()
export class HookDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  gameId: string;

  @Field()
  trigger: Trigger;

  @Field(() => [Action])
  @IsArray()
  actions: Action[];

  @Field(() => [Criteria])
  @IsArray()
  criteria: Criteria[];
}
