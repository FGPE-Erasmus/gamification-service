import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType('LoginResponse')
export class LoginResponseDto {
  @Field(() => Int)
  @Expose()
  'not-before-policy'?: number;

  @Field()
  @Expose()
  access_token?: string;

  @Field(() => Int)
  @Expose()
  expires_in?: number;

  @Field()
  @Expose()
  id_token?: string;

  @Field(() => Int)
  @Expose()
  refresh_expires_in?: number;

  @Field()
  @Expose()
  refresh_token?: string;

  @Field()
  @Expose()
  scope?: string;

  @Field()
  @Expose()
  session_state?: string;

  @Field()
  @Expose()
  token_type?: string;
}
