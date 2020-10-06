import { ArgsType, Field, ID } from '@nestjs/graphql';
import { Allow, IsMongoId, IsOptional, ValidateNested } from 'class-validator';

import { LeaderboardInput } from '../inputs/leaderboard.input';

@ArgsType()
export class UpsertLeaderboardArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @Field()
  @Allow()
  @ValidateNested()
  leaderboardInput: LeaderboardInput;
}
