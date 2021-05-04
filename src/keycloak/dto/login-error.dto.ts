import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType('LoginError')
export class LoginErrorDto {
  @Field()
  @Expose()
  error?: string;

  @Field()
  @Expose()
  error_description?: string;
}
