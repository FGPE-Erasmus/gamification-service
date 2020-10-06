import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Difficulty } from '../models/difficulty.enum';
import { Mode } from '../models/mode.enum';
import { GameDto } from '../../game/dto/game.dto';

@ObjectType('Challenge')
export class ChallengeDto {
  @Field(() => ID)
  id?: string;

  @Field(() => GameDto)
  game?: GameDto;

  @Field(() => ChallengeDto, { nullable: true })
  parentChallenge?: ChallengeDto;

  @Field()
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Difficulty)
  difficulty?: Difficulty;

  @Field(() => Mode)
  mode?: Mode;

  @Field(() => [String])
  modeParameters?: string[];

  @Field(() => [String])
  refs?: string[];

  @Field()
  locked?: boolean;

  @Field()
  hidden?: boolean;
}
