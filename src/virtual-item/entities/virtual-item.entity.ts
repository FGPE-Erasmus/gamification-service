import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, ObjectIdColumn, ObjectID, ManyToMany } from 'typeorm';
import { IReward } from 'src/common/interfaces/reward.interface';
import { RewardType } from 'src/common/enum/reward-type.enum';
import { PlayerVirtualItemEntity as PlayerVirtualItem } from './virtual-item-player.entity';

@Entity('VirtualItem')
@ObjectType('VirtualItem')
export class VirtualItemEntity implements IReward {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field(() => [PlayerVirtualItem])
  @ManyToMany(() => PlayerVirtualItem)
  players: PlayerVirtualItem[];

  @Field(() => RewardType)
  @Column()
  type: RewardType.VIRTUAL_ITEM;

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
