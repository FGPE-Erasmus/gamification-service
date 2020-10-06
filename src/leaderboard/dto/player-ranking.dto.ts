import { Field, ObjectType } from '@nestjs/graphql';
import graphqlTypeJson from 'graphql-type-json';

import { PlayerDto } from '../../player/dto/player.dto';

@ObjectType('Ranking')
export class PlayerRankingDto {
  @Field(() => PlayerDto)
  player?: PlayerDto;

  @Field(() => graphqlTypeJson, { defaultValue: () => ({}) })
  score?: Map<string, number>;
}
