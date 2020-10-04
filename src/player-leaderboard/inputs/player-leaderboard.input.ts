import { Field, InputType } from '@nestjs/graphql';
import graphqlTypeJson from 'graphql-type-json';

@InputType()
export default class PlayerLeaderboardInput {

  @Field()
  player: string;

  @Field()
  leaderboard: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  score: { [key: string]: number };
}
