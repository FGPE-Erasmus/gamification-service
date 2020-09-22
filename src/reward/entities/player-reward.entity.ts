import { Entity, Column, ObjectIdColumn, ObjectID, ManyToOne } from 'typeorm';
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
  @ManyToOne(() => Player, { primary: true })
  players: Player[];

  @Field(() => Reward)
  @ManyToOne(() => Reward, { primary: true })
  rewards: Reward[];

  @Field()
  @Column()
  count: number;
}
