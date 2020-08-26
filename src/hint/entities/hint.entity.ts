import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IReward } from 'src/common/interfaces/reward.interface';

@Entity('Hint')
@ObjectType('Hint')
export class HintEntity implements IReward {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field()
  @Column()
  gameId: string;

  @Field()
  @Column()
  playerId: string;

  @Field()
  @Column()
  exerciseId: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  recurrenceLimit: 1;

  @Field()
  @Column()
  message: string;
}
