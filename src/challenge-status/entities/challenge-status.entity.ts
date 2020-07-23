import { Entity, Column, Timestamp } from 'typeorm';
import { InputType, Field, ObjectType, ArgsType } from '@nestjs/graphql';
import { State } from './state.enum';

@Entity('ChallengeStatus')
@ObjectType('ChallengeStatus')
export class ChallengeStatusEntity {
  @Field()
  @Column()
  startedAt: Date;

  @Field()
  @Column()
  endedAt: Date;

  @Field(() => [State])
  @Column()
  state: State[];

  @Field()
  @Column()
  openedAt: Date;
}
