import { Entity, Column, ObjectIdColumn, ObjectID, ManyToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IReward } from 'src/common/interfaces/reward.interface';
import { PlayerBadgeEntity as PlayerBadge } from './badge-player.entity';
import { RewardType } from 'src/common/enum/reward-type.enum';

@Entity('Badge')
@ObjectType('Badge')
export class BadgeEntity implements IReward {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field(() => RewardType)
  @Column()
  kind: RewardType.BADGE;

  @Field(() => [PlayerBadge])
  @ManyToMany(() => PlayerBadge)
  players: PlayerBadge[];

  @Field()
  @Column()
  gameId: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  recurrenceLimit: number;
}
