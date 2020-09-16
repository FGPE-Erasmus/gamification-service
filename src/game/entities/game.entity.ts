import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity('Game')
@ObjectType('Game')
export class GameEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column()
  description?: string;

  @Field({ nullable: true })
  @Column()
  gedilLayerId?: string;

  @Field({ nullable: true })
  @Column()
  gedilLayerDescription?: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  /* @Field(() => UserEntity)
  @ManyToMany(() => UserEntity)
  enrolled: UserEntity; */
}
