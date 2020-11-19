import { ObjectType, Field, ID } from '@nestjs/graphql';

import { GameDto } from '../../game/dto/game.dto';
import { PlayerDto } from '../../player/dto/player.dto';

@ObjectType('Group')
export class GroupDto {
  @Field(() => ID)
  id?: string;

  @Field(() => GameDto)
  game?: string;

  @Field()
  name?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => [PlayerDto])
  players?: string[];

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
