import { Field, ArgsType } from '@nestjs/graphql';
import { MinLength, MaxLength } from 'class-validator';

@ArgsType()
export default class LoginDto {
  @Field()
  @MinLength(4)
  @MaxLength(200)
  login: string;

  @Field()
  @MinLength(6)
  password: string;
}
