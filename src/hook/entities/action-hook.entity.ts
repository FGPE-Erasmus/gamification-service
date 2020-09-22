import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm';

import { ChallengeEntity as Challenge } from '../../challenge/entities/challenge.entity';
import { GameEntity as Game } from '../../game/entities/game.entity';
import { TriggerEventEnum as TriggerEvent } from '../enum/trigger-event.enum';
import { ActionEmbed as Action } from './embedded/action.embed';
import { CriteriaEmbed as Criteria } from './embedded/criteria.embed';

@Entity('ActionHook')
@ObjectType('ActionHook')
export class ActionHookEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectID;

  @Field(() => Game)
  @Column()
  game: string;

  @Field(() => Challenge, { nullable: true })
  @Column({ nullable: true })
  parentChallenge?: string;

  @Field(() => TriggerEvent)
  @Column()
  trigger: TriggerEvent;

  @Field({ nullable: true })
  @Column({ nullable: true })
  sourceId?: string;

  @Field(() => Criteria, { nullable: true })
  @Column({ nullable: true })
  criteria?: Criteria;

  @Field(() => [Action])
  @Column({ default: [] })
  actions: Action[];

  @Field()
  @Column()
  recurrent: boolean;

  @Field()
  @Column({ default: true })
  active: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastRun?: Date;
}
