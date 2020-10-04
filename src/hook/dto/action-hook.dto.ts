import { Field, ID, ObjectType } from '@nestjs/graphql';

import { GameDto } from '../../game/dto/game.dto';
import { TriggerEventEnum as TriggerEvent } from '../enums/trigger-event.enum';
import { ChallengeDto } from '../../challenge/dto/challenge.dto';
import { CriteriaEmbedDto } from './embedded/criteria.dto';
import { ActionEmbedDto } from './embedded/action.dto';

@ObjectType('ActionHook')
export class ActionHookDto {

  @Field(() => ID)
  id: string;

  @Field(() => GameDto)
  game: GameDto | string;

  @Field(() => ChallengeDto, { nullable: true })
  parentChallenge?: string;

  @Field(() => TriggerEvent)
  trigger: TriggerEvent;

  @Field({ nullable: true })
  sourceId?: string;

  @Field(() => CriteriaEmbedDto, { nullable: true })
  criteria?: CriteriaEmbedDto;

  @Field(() => [ActionEmbedDto])
  actions: ActionEmbedDto[];

  @Field()
  recurrent: boolean;

  @Field()
  active: boolean;

  @Field({ nullable: true })
  lastRun?: Date;
}
