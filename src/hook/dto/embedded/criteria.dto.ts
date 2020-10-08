import { Field, ObjectType } from '@nestjs/graphql';

import { JunctorEnum as Junctor } from '../../enums/junctor.enum';
import { ConditionEmbedDto } from './condition.dto';

@ObjectType('Criteria')
export class CriteriaEmbedDto {
  @Field(() => [ConditionEmbedDto], { defaultValue: [] })
  conditions?: ConditionEmbedDto[];

  @Field(() => [Junctor], { defaultValue: [] })
  junctors?: Junctor[];
}
