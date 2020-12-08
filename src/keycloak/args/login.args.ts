import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

@ArgsType()
export class LoginArgs {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9]+([_.-]?[a-zA-Z0-9])*$/)
  @MinLength(4)
  @MaxLength(50)
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  scope?: string;

  @Field({ nullable: true })
  @IsOptional()
  refreshToken?: string;

  @Field({ nullable: true })
  @IsOptional()
  redirectUri?: string;
}
