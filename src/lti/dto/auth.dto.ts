import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('LtiAuth')
export class LtiAuthDto {
  @Field()
  ltik: string;

  @Field()
  game?: string;

  @Field()
  challenge?: string;

  @Field()
  activity?: string;

  @Field()
  toUrl: string;
}
