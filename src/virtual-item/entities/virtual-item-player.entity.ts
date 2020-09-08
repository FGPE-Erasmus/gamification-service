import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { VirtualItemEntity as VirtualItem } from './virtual-item.entity';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';

@Entity('PlayerVirtualItem')
@ObjectType('PlayerVirtualItem')
export class PlayerVirtualItemEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectID;

  @Field(() => Player)
  @Column('player')
  player: Player;

  @Field(() => VirtualItem)
  @Column('virtualItem')
  virtualItem: VirtualItem;

  @Field()
  @Column()
  count: number;
}
