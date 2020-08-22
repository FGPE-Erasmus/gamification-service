import { Field, ObjectType } from '@nestjs/graphql';
import { PrimaryColumn, Entity, Column } from 'typeorm';
import { json } from 'express';

@Entity('PlayerLeaderboard')
@ObjectType('PlayerLeaderboard')
export class PlayerLeaderboardEntity {
  @Field()
  @PrimaryColumn()
  playerId: string;

  @Field()
  @PrimaryColumn()
  leaderboardId: string;

  @Field(() => json, { nullable: true })
  @Column()
  score: { [key: string]: number };
}
