import { Column, Entity, ObjectID, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

import { EmailScalar as Email } from '../../common/scalars/email.scalar';
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
  telephone?: string;

  @Field({ nullable: true })
  @Column()
  birthDate?: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @Column()
  active: boolean;
}
