import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

import { ChallengeEntity as Challenge } from '../../challenge/entities/challenge.entity';
import { GameEntity as Game } from '../../game/entities/game.entity';
import { Difficulty } from './difficulty.enum';
import { Mode } from './mode.enum';
import { FilterableField } from '@nestjs-query/query-graphql/dist/src/decorators/filterable-field.decorator';

@Entity('Challenge')
@ObjectType('Challenge')
export class ChallengeEntity {
  @FilterableField(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @FilterableField(() => Challenge, { nullable: true })
  @Column()
  parentChallenge: string;

  @FilterableField()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column()
  description: string;

  @FilterableField(() => Game)
  @Column()
  game: string;

  @FilterableField(() => Difficulty)
  @Column()
  difficulty: Difficulty;

  @FilterableField(() => Mode)
  @Column()
  mode: Mode;

  @Field(() => [String], { defaultValue: [] })
  @Column({ default: [] })
  modeParameters: string[];

  @Field(() => [String])
  @Column()
  refs: string[];

  @FilterableField()
  @Column()
  locked: boolean;

  @FilterableField()
  @Column()
  hidden: boolean;
}
