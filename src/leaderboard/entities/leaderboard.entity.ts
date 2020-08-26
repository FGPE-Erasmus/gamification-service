import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { ObjectType, ID, Field } from '@nestjs/graphql';
import { SortingOrders } from './sorting.enum';

@Entity('Leaderboard')
@ObjectType('Leaderboard')
export class LeaderboardEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  private readonly id: ObjectID;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  gameId: string;

  @Field(() => [String])
  @Column()
  metrics: string[];

  @Field(() => [SortingOrders])
  @Column()
  sortingOrders: SortingOrders[];
}
