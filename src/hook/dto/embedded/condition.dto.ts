import { Field, ObjectType } from '@nestjs/graphql';

import { ComparingFunctionEnum as ComparingFunction } from '../../enums/comparing-function.enum';

@ObjectType('Condition')
export class ConditionEmbedDto {
  @Field()
  order?: number;

  @Field()
  leftEntity?: string;

  @Field()
  leftProperty?: string;

  @Field(() => ComparingFunction)
  comparingFunction?: string;

  @Field()
  rightEntity?: string;

  @Field()
  rightProperty?: string;
}
