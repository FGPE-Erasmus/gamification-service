import { Column, Entity, ObjectID, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

import { EmailScalar as Email } from '../../common/scalars/email.scalar';
import { PlayerRewardEntity as PlayerReward } from '../../reward/entities/player-reward.entity';
import { Role } from './role.enum';

@Entity('User')
@ObjectType('User')
export class UserEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  username: string;

  @Field(() => Email)
  @Column()
  email: string;

  @Column({ select: false })
  password?: string;

  @Field(() => [Role])
  @Column({ default: [Role.USER] })
  roles: Role[];

  @Field({ nullable: true })
  @Column()
  photo?: string;

  @Field({ nullable: true })
  @Column()
  telephone?: string;

  @Field({ nullable: true })
  @Column()
  birthDate?: Date;

  @Column()
  active: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @Field(() => [PlayerReward])
  @OneToMany(
    () => PlayerReward,
    playerReward => playerReward.rewards,
  )
  players: PlayerReward[];
}
