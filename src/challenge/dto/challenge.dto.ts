import { Field, ID, ObjectType } from '@nestjs/graphql';

import { GameDto } from '../../game/dto/game.dto';
import { Difficulty } from '../models/difficulty.enum';
import { Mode } from '../models/mode.enum';

@ObjectType('Challenge')
export class ChallengeDto {
  @Field(() => ID)
  id?: string;

  @Field(() => GameDto)
  game?: string;

  @Field(() => ChallengeDto, { nullable: true })
  parentChallenge?: string;

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

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
