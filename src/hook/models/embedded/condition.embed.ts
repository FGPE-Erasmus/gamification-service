import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ConditionEmbed {
  @Prop()
  order: number;

  @Prop()
  leftEntity: string;

  @Prop()
  leftProperty: string;

  @Prop()
  comparingFunction: string;

  @Prop()
  rightEntity: string;

  @Prop()
  rightProperty: string;
}

export const ConditionEmbedSchema = SchemaFactory.createForClass(ConditionEmbed);
