import { ObjectIdColumn, Entity, ObjectID, Column, UpdateDateColumn } from 'typeorm';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Result } from './result.enum';
import { json } from 'express';

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

  @Field(() => json)
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
  @UpdateDateColumn({ type: 'timestamp' })
  submittedAt: Date;

  @Field({ nullable: true })
  @UpdateDateColumn({ type: 'timestamp' })
  evaluatedAt?: Date;
}
