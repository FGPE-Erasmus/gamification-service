import { Entity, Column } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { HintEntity as Hint } from './hint.entity';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';

@Entity('PlayerHint')
@ObjectType('PlayerHint')
export class PlayerHintEntity {
  @Field(() => Player)
  @Column()
  player: Player;

  @Field(() => Hint)
  @Column()
  hint: Hint;

  @Field()
  @Column()
  count: number;
}
