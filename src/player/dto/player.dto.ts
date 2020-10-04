import { ObjectType, Field, ID } from '@nestjs/graphql';

import { GameDto } from '../../game/dto/game.dto';
import { PlayerRewardDto } from '../../player-reward/dto/player-reward.dto';
import { UserDto } from '../../users/dto/user.dto';

@ObjectType('Player')
export class PlayerDto {

  @Field(() => ID)
  id: string;

  @Field(() => GameDto)
  game: GameDto | string;

  @Field(() => UserDto)
  user: UserDto | string;

  @Field()
  points: number;

  @Field(() => [PlayerRewardDto])
  rewards: PlayerRewardDto[];
}
