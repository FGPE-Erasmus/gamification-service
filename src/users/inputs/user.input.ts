import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, MinLength, IsEmail, MaxLength, IsString, Matches, IsArray, IsEnum } from 'class-validator';

import { EmailScalar as Email } from '../../common/scalars/email.scalar';
import { Role } from '../models/role.enum';

@InputType()
export class UserInput {

  @Field()
  @MinLength(4)
  @MaxLength(200)
  name: string;

  @Field()
  @IsString()
  @Matches(/^[a-zA-Z0-9]+([_.-]?[a-zA-Z0-9])*$/)
  @MinLength(4)
  @MaxLength(50)
  username: string;

  @Field(() => Email)
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  telephone?: string;

  @Field({ nullable: true })
  @IsOptional()
  birthDate?: Date;

  @Field(() => [ Role ], { nullable: true, defaultValue: [ Role.USER ] })
  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @Field({ nullable: true })
  @MinLength(6)
  password?: string;
}
