import { Field, ID, ObjectType } from '@nestjs/graphql';

import { ChallengeDto } from '../../challenge/dto/challenge.dto';
import { PlayerDto } from '../../player/dto/player.dto';
import { State } from '../models/state.enum';

@ObjectType('ChallengeStatus')
export class ChallengeStatusDto {

  @Field(() => ID)
  id: string;

  @Field(() => PlayerDto)
  player: PlayerDto | string;

  @Field(() => ChallengeDto)
  challenge: ChallengeDto | string;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  openedAt?: Date;

  @Field({ nullable: true })
  endedAt?: Date;

  @Field(() => State)
  state: State;
}
