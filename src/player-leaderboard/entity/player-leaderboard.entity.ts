import { Field, ObjectType } from '@nestjs/graphql';
import { PrimaryColumn, Entity, Column } from 'typeorm';

@Entity('PlayerLeaderboard')
@ObjectType('PlayerLeaderboard')
export class PlayerLeaderboardEntity {
  @Field()
  @PrimaryColumn()
  playerId: string;

  @Field()
  @PrimaryColumn()
  leaderboardId: string;

  @Field({ nullable: true })
  @Column()
  score: { [key: string]: number };
}
