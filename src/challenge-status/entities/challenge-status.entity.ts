import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { State } from './state.enum';

@Entity('ChallengeStatus')
@ObjectType('ChallengeStatus')
export class ChallengeStatusEntity {
  @Field(() => String)
  @PrimaryColumn()
  readonly studentId: string;

  @Field(() => String)
  @PrimaryColumn()
  readonly challengeId: string;

  @Field()
  @Column()
  gameId: string;

  @Field({ nullable: true })
  @Column()
  startedAt?: Date;

  @Field({ nullable: true })
  @Column()
  endedAt?: Date;

  @Field(() => [State])
  @Column()
  state: State[];

  @Field({ nullable: true })
  @Column()
  openedAt?: Date;
}
