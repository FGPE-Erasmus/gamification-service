import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Game } from '../../game/models/game.model';
import { Challenge } from '../models/challenge.model';
import { Difficulty } from '../models/difficulty.enum';
import { Mode } from '../models/mode.enum';
import { GameDto } from '../../game/dto/game.dto';

@ObjectType('Challenge')
export class ChallengeDto {

  @Field(() => ID)
  id: string;

  @Field(() => Game)
  game: GameDto | string;

  @Field(() => Challenge, { nullable: true })
  parentChallenge?: ChallengeDto | string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Difficulty)
  difficulty: Difficulty;

  @Field(() => Mode)
  mode: Mode;

  @Field(() => [String])
  modeParameters: string[];

  @Field(() => [String])
  refs: string[];

  @Field()
  locked: boolean;

  @Field()
  hidden: boolean;
}
