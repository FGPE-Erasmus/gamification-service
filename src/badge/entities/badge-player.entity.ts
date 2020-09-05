import { Entity, Column } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { BadgeEntity as Badge } from './badge.entity';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';

@Entity('PlayerBadge')
@ObjectType('PlayerBadge')
export class PlayerBadgeEntity {
  @Field(() => Player)
  @Column()
  player: Player;

  @Field(() => Badge)
  @Column()
  badge: Badge;

  @Field()
  @Column()
  count: number;
}
