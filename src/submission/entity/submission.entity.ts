import { ObjectIdColumn, Entity, ObjectID, Column, Timestamp, UpdateDateColumn } from 'typeorm';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Result } from './result.enum';

@Entity('Submission')
@ObjectType('Submission')
export class SubmissionEntity {
  [x: string]: any;
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectID;

  @Column()
  @Field()
  exerciseId: string;

  @Column()
  @Field()
  playerId: string;

  @Column()
  @Field()
  metrics: { [key: string]: number };

  @Column({ nullable: true })
  @Field(() => Result)
  result?: Result;

  @Column({ nullable: true })
  @Field()
  grade?: number;

  @Column({ nullable: true })
  @Field()
  feedback?: string;

  @UpdateDateColumn({ type: 'timestamp' })
  @Field()
  submittedAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  @Field()
  evaluatedAt?: Date;
}
