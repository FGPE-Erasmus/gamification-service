import { Prop } from '@nestjs/mongoose';

import { CategoryEnum as Category } from '../../enums/category.enum';

export class ActionEmbed {

  @Prop({ type: String, enum: Category })
  type: Category;

  @Prop({ type: [String] })
  parameters: string[];
}
