import { Entity, Column, ObjectIdColumn, ObjectID, ManyToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IReward } from 'src/common/interfaces/reward.interface';
import { PlayerHintEntity as PlayerHint } from './hint-player.entity';
import { RewardType } from 'src/common/enum/reward-type.enum';

@Entity('Hint')
@ObjectType('Hint')
export class HintEntity implements IReward {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field(() => RewardType)
  @Column()
  type: RewardType.HINT;

  @Field()
  @Column()
  gameId: string;

  @Field(() => [PlayerHint])
  @ManyToMany(() => PlayerHint)
  players: PlayerHint[];

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
