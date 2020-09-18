import { IsEnum, IsArray } from 'class-validator';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm';

import { Criteria } from '../other-dto/criteria.dto';
import { Action } from '../other-dto/action.dto';
import { Trigger } from '../other-dto/trigger.dto';

@Entity('ActionHook')
@ObjectType('ActionHook')
export class ActionHookEntity {
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
  @IsEnum([Criteria], { each: true })
  criteria: Criteria[];

  @Column()
  @Field(() => [Action])
  @IsArray()
  @IsEnum([Action], { each: true })
  actions: Action[];

  @Column()
  @Field()
  active: boolean;

  @Column()
  @Field()
  sourceId: string;

  @Column()
  @Field()
  lastRun: Date;
}
