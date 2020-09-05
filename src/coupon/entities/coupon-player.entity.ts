import { Entity, Column } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { CouponEntity as Coupon } from './coupon.entity';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';

@Entity('PlayerCoupon')
@ObjectType('PlayerCoupon')
export class PlayerCouponEntity {
  @Field(() => Player)
  @Column()
  player: Player;

  @Field(() => Coupon)
  @Column()
  coupon: Coupon;

  @Field()
  @Column()
  count: number;
}
