import { ObjectType, Field } from '@nestjs/graphql';
import { Category } from '../enums/category.enum';
import { IsArray, IsEnum } from 'class-validator';

@ObjectType('Action')
export class Action {
  @Field()
  @IsEnum(Category, { each: true })
  type: Category;

  @Field(() => [String])
  @IsArray()
  parameters: string[];
}
