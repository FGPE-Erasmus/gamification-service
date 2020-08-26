import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

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
}
