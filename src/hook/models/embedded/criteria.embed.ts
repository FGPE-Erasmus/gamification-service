import { Prop } from '@nestjs/mongoose';

import { JunctorEnum as Junctor } from '../../enums/junctor.enum';
import { ConditionEmbed } from './condition.embed';


export class CriteriaEmbed {

  @Prop({ type: [ ConditionEmbed ], default: () => [] })
  conditions: ConditionEmbed[];

  @Prop({ type: [ Junctor ], default: () => [] })
  junctors: Junctor[];
}
