import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Platform')
export class PlatformDto {
  @Field()
  url: string;

  @Field()
  name: string;

  @Field()
  clientId: string;
}
