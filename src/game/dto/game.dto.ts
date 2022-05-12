import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PlayerDto } from '../../player/dto/player.dto';
import { SubmissionDto } from '../../submission/dto/submission.dto';
import { UserDto } from '../../keycloak/dto/user.dto';
import { ValidationDto } from '../../submission/dto/validation.dto';
import { GameStateEnum } from '../enum/game-state.enum';
import { EvaluationEngine } from '../../submission/models/evaluation-engine.enum';
import { ChallengeDto } from '../../challenge/dto/challenge.dto';
import { GroupDto } from '../../group/dto/group.dto';

@ObjectType('Game')
export class GameDto {
  @Field(() => ID)
  id?: string;

  @Field()
  name?: string;

  @Field()
  archival?: boolean;

  @Field()
  private?: boolean;

  @Field(() => GameStateEnum)
  state?: GameStateEnum;

  @Field(() => EvaluationEngine)
  evaluationEngine?: EvaluationEngine;

  @Field({ nullable: true })
  description?: string;

  @Field()
  courseId: string;

  @Field({ nullable: true })
  gedilLayerId?: string;

  @Field({ nullable: true })
  gedilLayerDescription?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => [UserDto])
  instructors?: string[];

  @Field(() => [ChallengeDto])
  challenges?: string[];

  @Field(() => [GroupDto])
  groups?: string[];

  @Field(() => [PlayerDto])
  players?: string[];

  @Field(() => [SubmissionDto])
  submissions?: string[];

  @Field(() => [ValidationDto])
  validations?: string[];

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
