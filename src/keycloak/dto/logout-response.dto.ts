import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType('LogoutResponse')
export class LogoutResponseDto {
  @Field({ nullable: true })
  @Expose()
  message?: string;
}
