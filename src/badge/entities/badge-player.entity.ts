import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { BadgeEntity as Badge } from './badge.entity';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';

@Entity('PlayerBadge')
@ObjectType('PlayerBadge')
export class PlayerBadgeEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectID;

  @Field(() => Player)
  @Column('player')
  player: Player;

  @Field(() => Badge)
  @Column('badge')
  badge: Badge;

  @Field()
  @Column()
  count: number;
}
