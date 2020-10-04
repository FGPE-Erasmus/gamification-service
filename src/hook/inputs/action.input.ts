import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsString } from 'class-validator';

import { CategoryEnum as Category } from '../enums/category.enum';

@InputType()
export class ActionInput {

  @Field(() => Category, { defaultValue: [] })
  @IsEnum(Category)
  type: Category;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  parameters: string[];
}
