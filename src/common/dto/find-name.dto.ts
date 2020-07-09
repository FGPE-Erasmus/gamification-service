import { ArgsType, Field, Int, ID } from '@nestjs/graphql';
import { Max, Min, MinLength, IsArray, IsMongoId } from 'class-validator';

import { order } from '../types/order.type';

@ArgsType()
export class FindNameDto {
  @Field(() => Int)
  @Min(0)
  skip = 0;

  @Field(() => Int)
  @Min(1)
  @Max(50)
  take = 50;

  @Field(() => [ID], { nullable: true })
  @IsArray()
  @IsMongoId({ each: true })
  ids?: string[];

  @Field({ nullable: true })
  @MinLength(3)
  name?: string;

  @Field(() => String, { nullable: true })
  order?: order = 'DESC';

  @Field({ nullable: true })
  fieldSort?: string = 'updatedAt';
}
