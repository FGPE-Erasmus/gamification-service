import { Field, ID, ObjectType } from '@nestjs/graphql';

import { ChallengeDto } from '../../challenge/dto/challenge.dto';
import { GameDto } from '../../game/dto/game.dto';
import { CriteriaEmbedDto } from './embedded/criteria.dto';
import { ActionEmbedDto } from './embedded/action.dto';

@ObjectType('ScheduledHook')
export class ScheduledHookDto {

  @Field(() => ID)
  id: string;

  @Field(() => GameDto)
  game: GameDto | string;

  @Field(() => ChallengeDto, { nullable: true })
  parentChallenge?: ChallengeDto | string;

  @Field(() => CriteriaEmbedDto, { nullable: true })
  criteria?: CriteriaEmbedDto;

  @Field(() => [ActionEmbedDto])
  actions: ActionEmbedDto[];

  @Field()
  recurrent: boolean;

  @Field({ nullable: true })
  cron?: string;

  @Field({ nullable: true })
  interval?: number;

  @Field()
  active: boolean;

  @Field({ nullable: true })
  lastRun?: Date;
}
