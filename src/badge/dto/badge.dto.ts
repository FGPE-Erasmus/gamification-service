import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('Badge')
export class BadgeDto {
  @Field()
  playerId: string;

  @Field()
  gameId: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  recurrenceLimit: number;
}
