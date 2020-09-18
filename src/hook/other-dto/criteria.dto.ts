import { ObjectType, Field } from '@nestjs/graphql';
import { IsArray } from 'class-validator';

import { Junctor } from '../enums/junctor.enum';
import { Condition } from './condition.dto';

@ObjectType('Criteria')
export class Criteria {
  @Field(() => [Condition])
  @IsArray()
  conditions: Condition[];

  @Field(() => [Junctor])
  @IsArray()
  junctors: Junctor[];
}
