import { ObjectType, ID, Field } from '@nestjs/graphql';

import { ChallengeDto } from '../../challenge/dto/challenge.dto';
import { GameDto } from '../../game/dto/game.dto';
import { SortingOrder } from '../models/sorting.enum';

@ObjectType('Leaderboard')
export class LeaderboardDto {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => GameDto, { nullable: true })
  game?: string;

  @Field(() => ChallengeDto, { nullable: true })
  parentChallenge?: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => [String], { nullable: true })
  metrics?: string[];

  @Field(() => [SortingOrder], { nullable: true })
  sortingOrders?: SortingOrder[];

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
