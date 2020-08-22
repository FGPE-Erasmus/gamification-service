import { ObjectType, Field } from '@nestjs/graphql';
import { PlayerLeaderboardEntity as PlayerLeaderboard } from 'src/player-leaderboard/entities/player-leaderboard.entity';

@ObjectType('SortedResult')
export class SortedResult {
  @Field()
  name: string;

  @Field()
  entries: PlayerLeaderboard[];
}
