import { ArgsType, Field } from '@nestjs/graphql';
import { SortingOrders } from './entities/sorting.enum';

@ArgsType()
export class LeaderboardDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  metrics: string[];

  @Field(() => [SortingOrders])
  sortingOrders: SortingOrders[];
}