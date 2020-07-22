import { Field, ArgsType } from '@nestjs/graphql';
import { MinLength, MaxLength } from 'class-validator';

@ArgsType()
export default class GameDto {
  @Field()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field()
  userIds: string;
}
