import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType('Auth')
export class AuthDto {
  @Field({ nullable: true })
  @Expose()
  accessToken?: string;

  @Field(() => Int, { nullable: true })
  @Expose()
  expiresIn?: number;

  @Field({ nullable: true })
  @Expose()
  message: string;

  @Field(() => Int, { nullable: true })
  @Expose()
  refreshExpiresIn?: number;

  @Field({ nullable: true })
  @Expose()
  refreshToken?: string;

  @Field({ nullable: true })
  @Expose()
  scope?: string;

  @Field({ nullable: true })
  @Expose()
  tokenType?: string;
}
