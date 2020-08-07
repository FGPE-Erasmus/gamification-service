import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export default class PlayerLeaderboardDto {
  @Field()
  playerId: string;

  @Field()
  leaderboardId: string;

  @Field({ nullable: true })
  score: { [key: string]: number };
}
