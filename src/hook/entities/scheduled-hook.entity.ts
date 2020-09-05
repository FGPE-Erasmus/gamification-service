import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { HookEntity } from './hook.entity';
import { IsArray } from 'class-validator';
import { Criteria } from '../other-dto/criteria.dto';
import { Action } from '../other-dto/action.dto';

@Entity('ScheduledHook')
@ObjectType('ScheduledHook')
export class ScheduledHookEntity extends HookEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectID;

  @Column()
  @Field()
  recurrent: boolean;

  @Column()
  @Field()
  trigger: string;

  @Column()
  @Field()
  nextRun: Date;

  @Column()
  @Field()
  lastRun: Date;

  @Column()
  @Field()
  gameId: string;

  @Column()
  @Field()
  @IsArray()
  actions: Action[];

  @Column()
  @Field()
  @IsArray()
  criteria: Criteria[];

  @Column()
  @Field()
  active: boolean;
}
