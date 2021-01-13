import { Field, ObjectType } from '@nestjs/graphql';
import { ActivityDto } from './activity.dto';
import { GameDto } from '../../game/dto/game.dto';

@ObjectType('ActivityStatus')
export class ActivityStatusDto {
  @Field(() => GameDto)
  game?: string;

  @Field(() => ActivityDto, { nullable: true })
  activity?: string;

  @Field({ nullable: true, defaultValue: false })
  solved?: boolean;
}
