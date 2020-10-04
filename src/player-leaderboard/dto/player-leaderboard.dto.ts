import { ArgsType, Field } from '@nestjs/graphql';
import graphqlTypeJson from 'graphql-type-json';

@ArgsType()
export default class PlayerLeaderboardDto {

  @Field()
  playerId: string;

  @Field()
  leaderboardId: string;

  @Field()
  gameId: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  score: { [key: string]: number };
}
