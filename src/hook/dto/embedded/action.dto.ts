import { Field, ObjectType } from '@nestjs/graphql';

import { CategoryEnum as Category } from '../../enums/category.enum';

@ObjectType('Action')
export class ActionEmbedDto {

  @Field(() => Category)
  type: Category;

  @Field(() => [String], { defaultValue: [] })
  parameters: string[];
}
