import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Platform')
export class PlatformDto {
  @Field()
  publicKey: string;
}
