import { Field, ObjectType } from '@nestjs/graphql';
import graphqlTypeJson from 'graphql-type-json';

import { PlayerDto } from '../../player/dto/player.dto';

@ObjectType('Ranking')
export class RankingDto {

  @Field(() => PlayerDto)
  player: PlayerDto | string;

  @Field(() => graphqlTypeJson, { defaultValue: () => ({}) })
  score: Map<string, number>;
}
