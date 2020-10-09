import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { JunctorEnum as Junctor } from '../../enums/junctor.enum';
import { ConditionEmbed } from './condition.embed';

@Schema()
export class CriteriaEmbed {
  @Prop({ type: () => [ConditionEmbed], default: () => [] })
  conditions: ConditionEmbed[];

  @Prop({ type: () => [String], enum: Junctor, default: () => [] })
  junctors: Junctor[];
}

export const CriteriaEmbedSchema = SchemaFactory.createForClass(CriteriaEmbed);
