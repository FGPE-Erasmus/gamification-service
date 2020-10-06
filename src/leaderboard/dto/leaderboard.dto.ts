import { ObjectType, ID, Field } from '@nestjs/graphql';

import { ChallengeDto } from '../../challenge/dto/challenge.dto';
import { GameDto } from '../../game/dto/game.dto';
import { SortingOrder } from '../models/sorting.enum';

@ObjectType('Leaderboard')
export class LeaderboardDto {
  @Field(() => ID)
  id?: string;

  @Field(() => GameDto)
  game?: GameDto;

  @Field(() => ChallengeDto, { nullable: true })
  parentChallenge?: ChallengeDto;

  @Field()
  name?: string;

  @Field(() => [String])
  metrics?: string[];

  @Field(() => [SortingOrder])
  sortingOrders?: SortingOrder[];
}
