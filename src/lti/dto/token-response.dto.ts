import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TokenResponse')
export class TokenResponseDto {
  @Field()
  accessToken: string;

  @Field()
  expiresIn: string;

  @Field()
  refreshExpiresIn: string;

  @Field()
  refreshToken: string;

  @Field()
  tokenType: string;
}
