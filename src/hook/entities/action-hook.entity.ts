import { IsEnum, IsArray } from 'class-validator';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Trigger } from '../enums/trigger.enum';
import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm';
import { HookEntity } from 'src/hook/entities/hook.entity';
import { Criteria } from '../other-dto/criteria.dto';
import { Action } from '../other-dto/action.dto';

@Entity('ActionHook')
@ObjectType('ActionHook')
export class ActionHookEntity extends HookEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectID;

  @Column()
  @Field()
  @IsEnum(Trigger, { each: true })
  trigger: Trigger;

  @Column()
  @Field()
  sourceId: string;

  @Column()
  @Field()
  lastRun: Date;

  @Column()
  @Field()
  gameId: string;

  @Column()
  @Field(() => [Action])
  @IsArray()
  actions: Action[];

  @Column()
  @Field(() => [Criteria])
  @IsArray()
  criteria: Criteria[];

  @Column()
  @Field()
  active: boolean;
}
