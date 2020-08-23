import { ObjectIdColumn, Entity, ObjectID, Column, UpdateDateColumn } from 'typeorm';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Result } from './result.enum';
import graphqlTypeJson from 'graphql-type-json';

@Entity('Submission')
@ObjectType('Submission')
export class SubmissionEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  id: ObjectID;

  @Field()
  @Column()
  exerciseId: string;

  @Field()
  @Column()
  playerId: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  @Column()
  metrics: { [key: string]: number };

  @Field(() => Result, { nullable: true })
  @Column()
  result?: Result;

  @Field({ nullable: true })
  @Column()
  grade?: number;

  @Field({ nullable: true })
  @Column()
  feedback?: string;

  @Field()
  @Column({ type: 'timestamp' })
  submittedAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp' })
  evaluatedAt?: Date;
}
