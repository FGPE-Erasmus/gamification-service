import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenDto {
  @Field()
  token: string;

  @Field()
  expiresIn: number;
}
