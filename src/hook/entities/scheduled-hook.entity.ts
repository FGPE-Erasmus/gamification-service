import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { HookEntity } from './hook.entity';

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
}
