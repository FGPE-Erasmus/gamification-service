import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { IsArray } from 'class-validator';

import { Criteria } from '../other-dto/criteria.dto';
import { Action } from '../other-dto/action.dto';
import { Trigger } from '../other-dto/trigger.dto';

@Entity('ScheduledHook')
@ObjectType('ScheduledHook')
export class ScheduledHookEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectID;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  gameId: string;

  @Column()
  @Field()
  trigger: Trigger;

  @Column()
  @Field(() => [Criteria])
  @IsArray()
  criteria: Criteria[];

  @Column()
  @Field(() => [Action])
  @IsArray()
  actions: Action[];

  @Column()
  @Field()
  active: boolean;

  @Column()
  @Field()
  recurrent: boolean;

  @Column()
  @Field()
  nextRun: Date;

  @Column()
  @Field()
  lastRun: Date;
}
