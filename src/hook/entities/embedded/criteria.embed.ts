import { ObjectType, Field } from '@nestjs/graphql';

import { JunctorEnum as Junctor } from '../../enum/junctor.enum';
import { ConditionEmbed } from './condition.embed';

@ObjectType('Criteria')
export class CriteriaEmbed {
  @Field(() => [ConditionEmbed], { defaultValue: [] })
  conditions: ConditionEmbed[];

  @Field(() => [Junctor], { defaultValue: [] })
  junctors: Junctor[];
}
