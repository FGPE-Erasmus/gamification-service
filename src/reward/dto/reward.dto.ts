import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ObjectID } from 'typeorm';

import { ChallengeEntity as Challenge } from '../../challenge/entities/challenge.entity';
import { GameEntity as Game } from '../../game/entities/game.entity';
import { PlayerRewardEntity as PlayerReward } from '../entities/player-reward.entity';
import { RewardType } from '../entities/reward-type.enum';

@ObjectType('Reward')
export class RewardDto {
  @Field(() => ID)
  id: ObjectID;

  @Field(() => Game, { nullable: true })
  game: string;

  @Field(() => Challenge, { nullable: true })
  parentChallenge?: string;

  @Field(() => RewardType)
  kind: RewardType;

  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  image?: string;

  @Field()
  recurrent: boolean;

  @Field({ nullable: true })
  cost?: number;

  @Field({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  message?: string;

  @Field(() => [Challenge], { nullable: true })
  challenges?: string[];

  @Field(() => [PlayerReward])
  players: string[];
}
