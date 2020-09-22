import { Entity, ObjectIdColumn, ObjectID, Column, ManyToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

import { PlayerRewardEntity as PlayerReward } from '../../reward/entities/player-reward.entity';

@Entity('Player')
@ObjectType('Player')
export class PlayerEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field()
  @Column()
  readonly userId: string;

  @Field()
  @Column()
  gameId: string;

  @Field()
  @Column()
  points: number;

  @Field(() => [PlayerReward])
  @ManyToMany(() => PlayerReward)
  rewards: PlayerReward[];
}
