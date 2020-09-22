import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { ObjectType, ID, Field } from '@nestjs/graphql';

import { ChallengeEntity as Challenge } from '../../challenge/entities/challenge.entity';
import { GameEntity as Game } from '../../game/entities/game.entity';
import { SortingOrders } from './sorting.enum';

@Entity('Leaderboard')
@ObjectType('Leaderboard')
export class LeaderboardEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  private readonly id: ObjectID;

  @Field(() => Game)
  @Column()
  game: string;

  @Field(() => Challenge, { nullable: true })
  @Column({ nullable: true })
  parentChallenge?: string;

  @Field()
  @Column()
  name: string;

  @Field(() => [String])
  @Column()
  metrics: string[];

  @Field(() => [SortingOrders])
  @Column()
  sortingOrders: SortingOrders[];
}
