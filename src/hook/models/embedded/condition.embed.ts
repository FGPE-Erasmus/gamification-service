import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ComparingFunctionEnum as ComparingFunction } from '../../enums/comparing-function.enum';
import { EntityEnum as Entity } from '../../enums/entity.enum';

@Schema()
export class ConditionEmbed {
  @Prop()
  order: number;

  @Prop()
  leftEntity: Entity;

  @Prop()
  leftProperty: string;

  @Prop({ type: () => String, enum: ComparingFunction })
  comparingFunction: ComparingFunction;

  @Prop()
  rightEntity?: Entity;

  @Prop()
  rightProperty?: string;
}

export const ConditionEmbedSchema = SchemaFactory.createForClass(ConditionEmbed);
