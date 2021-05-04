import { ArgsType, Field, ID, Int } from '@nestjs/graphql';
import { Allow, IsArray, IsMongoId, Max, Min, MinLength } from 'class-validator';

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
  @Allow()
  order?: order = 'DESC';

  @Field({ nullable: true })
  @Allow()
  fieldSort?: string = 'updatedAt';
}
