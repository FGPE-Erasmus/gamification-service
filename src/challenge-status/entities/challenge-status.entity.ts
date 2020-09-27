import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { State } from './state.enum';
import { FilterableField } from '@nestjs-query/query-graphql/dist/src/decorators';

@Entity('ChallengeStatus')
@ObjectType('ChallengeStatus')
export class ChallengeStatusEntity {
  @FilterableField(() => String)
  @PrimaryColumn()
  readonly studentId: string;

  @FilterableField(() => String)
  @PrimaryColumn()
  readonly challengeId: string;

  @FilterableField()
  @Column()
  game: string;

  @Field({ nullable: true })
  @Column()
  startedAt?: Date;

  @FilterableField({ nullable: true })
  @Column()
  endedAt?: Date;

  @FilterableField(() => [State])
  @Column()
  state: State[];

  @FilterableField({ nullable: true })
  @Column()
  openedAt?: Date;
}
