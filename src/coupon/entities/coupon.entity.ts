import { Column, Entity, ObjectIdColumn, ObjectID, ManyToMany } from 'typeorm';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IReward } from 'src/common/interfaces/reward.interface';
import { RewardType } from 'src/common/enum/reward-type.enum';
import { PlayerCouponEntity as PlayerCoupon } from './coupon-player.entity';

@Entity('Coupon')
@ObjectType('Coupon')
export class CouponEntity implements IReward {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field(() => [PlayerCoupon])
  @ManyToMany(() => PlayerCoupon)
  players: PlayerCoupon[];

  @Field(() => RewardType)
  @Column()
  type: RewardType.COUPON;

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
