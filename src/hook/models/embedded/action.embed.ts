import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { CategoryEnum as Category } from '../../enums/category.enum';

@Schema()
export class ActionEmbed {
  @Prop({ type: () => String, enum: Category })
  type: Category;

  @Prop({ type: () => [String] })
  parameters: string[];
}

export const ActionEmbedSchema = SchemaFactory.createForClass(ActionEmbed);
