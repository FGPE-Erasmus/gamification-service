import { Field, ObjectType } from '@nestjs/graphql';

import { GameEntity } from '../../game/entities/game.entity';

@ObjectType({ isAbstract: true })
export class RewardDto {
  @Field(() => GameEntity)
  game: string;

  @Field()
  name: string;

  @Field()
  description?: string;

  @Field()
  cost?: number;

  @Field()
  recurrent: boolean;
}
