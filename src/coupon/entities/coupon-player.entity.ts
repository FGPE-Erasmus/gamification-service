import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CouponEntity as Coupon } from './coupon.entity';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';

@Entity('PlayerCoupon')
@ObjectType('PlayerCoupon')
export class PlayerCouponEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectID;

  @Field(() => Player)
  @Column('player')
  player: Player;

  @Field(() => Coupon)
  @Column('coupon')
  coupon: Coupon;

  @Field()
  @Column()
  count: number;
}
