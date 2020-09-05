import { Entity, Column } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { VirtualItemEntity as VirtualItem } from './virtual-item.entity';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';

@Entity('PlayerVirtualItem')
@ObjectType('PlayerVirtualItem')
export class PlayerVirtualItemEntity {
  @Field(() => Player)
  @Column()
  player: Player;

  @Field(() => VirtualItem)
  @Column()
  virtualItem: VirtualItem;

  @Field()
  @Column()
  count: number;
}
