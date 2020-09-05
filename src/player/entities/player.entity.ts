import { Entity, ObjectIdColumn, ObjectID, Column, ManyToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PlayerBadgeEntity as PlayerBadge } from 'src/badge/entities/badge-player.entity';
import { PlayerCouponEntity as PlayerCoupon } from 'src/coupon/entities/coupon-player.entity';
import { PlayerHintEntity as PlayerHint } from 'src/hint/entities/hint-player.entity';
import { PlayerVirtualItemEntity as PlayerVirtualItem } from 'src/virtual-item/entities/virtual-item-player.entity';

@Entity('Player')
@ObjectType('Player')
export class PlayerEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field()
  @Column()
  readonly userId: string;

  @Field()
  @Column()
  gameId: string;

  @Field()
  @Column()
  points: number;

  @Field()
  @ManyToMany(() => PlayerBadge)
  badges: PlayerBadge[];

  @Field()
  @ManyToMany(() => PlayerCoupon)
  coupons: PlayerCoupon[];

  @Field()
  @ManyToMany(() => PlayerHint)
  hints: PlayerHint[];

  @Field()
  @ManyToMany(() => PlayerVirtualItem)
  virtualItems: PlayerVirtualItem[];
}
