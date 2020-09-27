import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

import { ChallengeEntity as Challenge } from '../../challenge/entities/challenge.entity';
import { GameEntity as Game } from '../../game/entities/game.entity';
import { PlayerRewardEntity as PlayerReward } from './player-reward.entity';
import { RewardType } from './reward-type.enum';

@ObjectType()
@Entity('Reward')
export class RewardEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field(() => Game, { nullable: true })
  @Column()
  game: string;

  @Field(() => Challenge, { nullable: true })
  @Column({ nullable: true })
  parentChallenge?: string;

  @Field(() => RewardType)
  @Column()
  kind: RewardType;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  image?: string;

  @Field()
  @Column({ default: false })
  recurrent: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  cost?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  message?: string;

  @Field(() => [Challenge], { nullable: true })
  @Column({ nullable: true })
  challenges?: string[];

  @Field(() => [PlayerReward])
  @Column()
  players: string[];
}
