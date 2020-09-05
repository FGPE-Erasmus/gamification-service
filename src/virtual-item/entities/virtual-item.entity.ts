import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, ObjectIdColumn, ObjectID } from 'typeorm';
import { IReward } from 'src/common/interfaces/reward.interface';
import { RewardType } from 'src/common/enum/reward-type.enum';

@Entity('VirtualItem')
@ObjectType('VirtualItem')
export class VirtualItemEntity implements IReward {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field()
  @Column()
  playerId: string;

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
