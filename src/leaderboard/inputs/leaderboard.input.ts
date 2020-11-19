import { Field, InputType } from '@nestjs/graphql';
import { SortingOrder } from '../models/sorting.enum';

@InputType()
export class LeaderboardInput {
  @Field()
  game: string;

  @Field()
  parentChallenge?: string;

  @Field()
  name: string;

  @Field()
  groups: boolean;

  @Field(() => [String])
  metrics: string[];

  @Field(() => [SortingOrder])
  sortingOrders: SortingOrder[];
}
