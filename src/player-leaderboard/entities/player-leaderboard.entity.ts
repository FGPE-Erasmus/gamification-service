import { Field, ObjectType } from '@nestjs/graphql';
import { PrimaryColumn, Entity, Column } from 'typeorm';
import graphqlTypeJson from 'graphql-type-json';

@Entity('PlayerLeaderboard')
@ObjectType('PlayerLeaderboard')
export class PlayerLeaderboardEntity {
  @Field()
  @PrimaryColumn()
  playerId: string;

  @Field()
  @PrimaryColumn()
  leaderboardId: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  @Column()
  score: { [key: string]: number };
}
