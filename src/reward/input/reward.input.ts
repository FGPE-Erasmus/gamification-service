import { Field, InputType } from '@nestjs/graphql';

import { GameEntity } from '../../game/entities/game.entity';

@InputType()
export class RewardInput {
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
