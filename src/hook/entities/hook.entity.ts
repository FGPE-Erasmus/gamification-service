import { Criteria } from 'src/hook/other-dto/criteria.dto';
import { Action } from 'src/hook/other-dto/action.dto';
import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsArray } from 'class-validator';

@Entity('Hook')
@ObjectType('Hook')
export class HookEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectID;

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
