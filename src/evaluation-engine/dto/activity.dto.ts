import { Field, ObjectType } from '@nestjs/graphql';
import { GameDto } from '../../game/dto/game.dto';

@ObjectType('Activity')
export class ActivityDto {
  @Field(() => GameDto)
  game?: string;

  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  timeout?: number;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  difficulty?: string;

  @Field({ nullable: true })
  statement?: string;

  @Field({ nullable: true, defaultValue: false })
  pdf?: boolean;
}
