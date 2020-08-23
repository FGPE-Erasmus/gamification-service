import { ObjectType, Field } from '@nestjs/graphql';
import PlayerLeaderboardDto from 'src/player-leaderboard/dto/player-leaderboard.dto';

@ObjectType('SortedResult')
export class SortedResult {
  @Field()
  name: string;

  @Field()
  entries: PlayerLeaderboardDto[];
}
