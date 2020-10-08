import { ObjectType, Field, ID } from '@nestjs/graphql';

import { GameDto } from '../../game/dto/game.dto';
import { PlayerRewardDto } from '../../player-reward/dto/player-reward.dto';
import { UserDto } from '../../users/dto/user.dto';
import { SubmissionDto } from '../../submission/dto/submission.dto';
import { ChallengeStatusDto } from '../../challenge-status/dto/challenge-status.dto';

@ObjectType('Player')
export class PlayerDto {
  @Field(() => ID)
  id?: string;

  @Field(() => GameDto)
  game?: string;

  @Field(() => UserDto)
  user?: string;

  @Field()
  points?: number;

  @Field(() => [SubmissionDto])
  submissions?: string[];

  @Field(() => [ChallengeStatusDto])
  learningPath?: string[];

  @Field(() => [PlayerRewardDto])
  rewards?: string[];

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
