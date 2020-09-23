import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

import { PlayerEntity as Player } from '../../player/entities/player.entity';
import { RewardEntity as Reward } from './reward.entity';

@Entity('PlayerReward')
@ObjectType('PlayerReward')
export class PlayerRewardEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectID;

  @Field(() => Player)
  @Column()
  players: string[];

  @Field(() => Reward)
  @Column()
  rewards: string[];

  @Field()
  @Column()
  count: number;
}
