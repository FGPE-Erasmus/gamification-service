import { Field, ObjectType, PartialType } from '@nestjs/graphql';

import { ConditionEmbedDto } from './condition.dto';
import { JunctorEnum as Junctor } from '../../enums/junctor.enum';

@ObjectType('Criteria')
export class CriteriaEmbedDto {

  @Field(() => [ConditionEmbedDto], { defaultValue: [] })
  conditions: ConditionEmbedDto[];

  @Field(() => [Junctor], { defaultValue: [] })
  junctors: Junctor[];
}
