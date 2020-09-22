import { Field, ObjectType } from '@nestjs/graphql';

import { CategoryEnum as Category } from '../../enum/category.enum';

@ObjectType('Action')
export class ActionEmbed {
  @Field(() => Category)
  type: Category;

  @Field(() => [String], { defaultValue: [] })
  parameters: string[];
}
