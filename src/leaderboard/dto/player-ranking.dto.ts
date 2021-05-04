import { Field, ObjectType } from '@nestjs/graphql';
import graphqlTypeJson from 'graphql-type-json';

import { PlayerDto } from '../../player/dto/player.dto';

@ObjectType('Ranking')
export class PlayerRankingDto {
  @Field(() => PlayerDto, { nullable: true })
  player?: string;

  @Field(() => graphqlTypeJson, { defaultValue: () => ({}) })
  score?: { [key: string]: any };
}
