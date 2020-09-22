import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToMany, ObjectID, ObjectIdColumn, OneToMany } from 'typeorm';

import { ChallengeEntity as Challenge } from '../../challenge/entities/challenge.entity';
import { GameEntity as Game } from '../../game/entities/game.entity';
import { PlayerRewardEntity as PlayerReward } from './player-reward.entity';
import { RewardType } from './reward-type.enum';

@Entity('Reward')
@ObjectType('Reward')
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

  @Field()
  @Column()
  cost: number;

  @Field()
  @Column()
  amount: number;

  @Field(() => [Challenge])
  @ManyToMany(() => Challenge)
  challenges: Challenge[];

  @Field()
  @Column()
  message: string;

  @Field(() => [PlayerReward])
  @OneToMany(
    () => PlayerReward,
    playerReward => playerReward.rewards,
  )
  players: PlayerReward[];
}
