import { Field, ID, ObjectType } from '@nestjs/graphql';

import { GameDto } from '../../game/dto/game.dto';
import { PlayerRewardDto } from '../../player-reward/dto/player-reward.dto';
import { SubmissionDto } from '../../submission/dto/submission.dto';
import { ChallengeStatusDto } from '../../challenge-status/dto/challenge-status.dto';
import { GroupDto } from '../../group/dto/group.dto';
import { UserDto } from '../../keycloak/dto/user.dto';
import { ValidationDto } from '../../submission/dto/validation.dto';
import { PlayerStatsDto } from './player-stats.dto';

@ObjectType('Player')
export class PlayerDto {
  @Field(() => ID)
  id?: string;

  @Field(() => GameDto)
  game?: string;

  @Field(() => UserDto)
  user?: string;

  @Field(() => GroupDto, { nullable: true })
  group?: string;

  @Field()
  points?: number;

  @Field(() => [SubmissionDto])
  submissions?: string[];

  @Field(() => [ValidationDto])
  validations?: string[];

  @Field(() => [ChallengeStatusDto])
  learningPath?: string[];

  @Field(() => [PlayerRewardDto])
  rewards?: string[];

  @Field(() => PlayerStatsDto)
  stats?: PlayerStatsDto;

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
