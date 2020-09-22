import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';

import { GameEntity as Game } from '../../game/entities/game.entity';
import { ChallengeEntity as Challenge } from '../../challenge/entities/challenge.entity';
import { ActionEmbed as Action } from './embedded/action.embed';
import { CriteriaEmbed as Criteria } from './embedded/criteria.embed';

@Entity('ScheduledHook')
@ObjectType('ScheduledHook')
export class ScheduledHookEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  id: ObjectID;

  @Field(() => Game)
  @Column()
  game: string;

  @Field(() => Challenge, { nullable: true })
  @Column({ nullable: true })
  parentChallenge?: string;

  @Field(() => Criteria, { nullable: true })
  @Column({ nullable: true })
  criteria?: Criteria;

  @Field(() => [Action])
  @Column({ default: [] })
  actions: Action[];

  @Field()
  @Column()
  recurrent: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  cron?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  interval?: number;

  @Field()
  @Column({ default: true })
  active: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastRun?: Date;
}
