import { IsEnum, IsArray } from 'class-validator';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Trigger } from '../enums/trigger.enum';
import { Criteria } from '../other-dto/criteria.dto';
import { Action } from '../other-dto/action.dto';
import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm';
import { Hook } from 'src/hook/entities/hook.entity';

@Entity('ActionHook')
@ObjectType('ActionHook')
export class ActionHookEntity extends Hook {
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
}
