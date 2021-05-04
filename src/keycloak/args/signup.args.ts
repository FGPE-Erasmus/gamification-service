import { IsDefined, IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ArgsType, Field } from '@nestjs/graphql';

import { EmailScalar as Email } from '../../common/scalars/email.scalar';

@ArgsType()
export default class SignupArgs {
  @Field()
  @MinLength(4)
  @MaxLength(200)
  firstName: string;

  @Field()
  @MinLength(4)
  @MaxLength(200)
  lastName: string;

  @Field()
  @IsDefined()
  @IsString()
  @Matches(/^[a-zA-Z0-9]+([_.-]?[a-zA-Z0-9])*$/)
  @MinLength(4)
  @MaxLength(50)
  username: string;

  @Field(() => Email)
  @IsDefined()
  @MaxLength(200)
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;
}
