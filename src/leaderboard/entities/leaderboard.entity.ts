import { Entity, ObjectIdColumn, ObjectID, Column, ManyToOne } from 'typeorm';
import { ObjectType, ID, Field } from '@nestjs/graphql';
import { SortingOrders } from './sorting.enum';
import { ChallengeEntity } from 'src/challenge/entities/challenge.entity';

@Entity('Leaderboard')
@ObjectType('Leaderboard')
export class LeaderboardEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  private readonly id: ObjectID;

  @Field()
  @Column()
  name: string;

  @Field(() => ChallengeEntity, { nullable: true })
  @ManyToOne(() => ChallengeEntity)
  challenge: ChallengeEntity;

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
