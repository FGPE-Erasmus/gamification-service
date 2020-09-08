import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { HintEntity as Hint } from './hint.entity';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';

@Entity('PlayerHint')
@ObjectType('PlayerHint')
export class PlayerHintEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectID;

  @Field(() => Player)
  @Column('player')
  player: Player;

  @Field(() => Hint)
  @Column('hint')
  hint: Hint;

  @Field()
  @Column()
  count: number;
}
