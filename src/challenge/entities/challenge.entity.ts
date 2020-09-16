import { Entity, ObjectIdColumn, ObjectID, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

import { Difficulty } from './difficulty.enum';
import { Mode } from './mode.enum';

@Entity('Challenge')
@ObjectType('Challenge')
export class ChallengeEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  gameId: string;

  @Field(() => ChallengeEntity, { nullable: true })
  @ManyToOne(() => ChallengeEntity)
  parentChallenge: ChallengeEntity;

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
