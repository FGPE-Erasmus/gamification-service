import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

import { ChallengeEntity as Challenge } from '../../challenge/entities/challenge.entity';
import { GameEntity as Game } from '../../game/entities/game.entity';
import { Difficulty } from './difficulty.enum';
import { Mode } from './mode.enum';

@Entity('Challenge')
@ObjectType('Challenge')
export class ChallengeEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field(() => Game)
  @Column()
  game: string;

  @Field(() => Challenge, { nullable: true })
  @Column()
  parentChallenge: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column()
  description: string;

  @Field(() => Difficulty)
  @Column()
  difficulty: Difficulty;

  @Field(() => Mode)
  @Column()
  mode: Mode;

  @Field(() => [String], { defaultValue: [] })
  @Column({ default: [] })
  modeParameters: string[];

  @Field(() => [String])
  @Column()
  refs: string[];

  @Field()
  @Column()
  locked: boolean;

  @Field()
  @Column()
  hidden: boolean;
}
