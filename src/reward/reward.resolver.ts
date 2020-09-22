import { UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveProperty, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { ChallengeEntity as Challenge } from '../challenge/entities/challenge.entity';
import { GameEntity as Game } from '../game/entities/game.entity';
import { ChallengeService } from '../challenge/challenge.service';
import { GameService } from '../game/game.service';
import { RewardEntity as Reward } from './entities/reward.entity';
import { RewardService } from './reward.service';

@Resolver(() => Reward)
export class RewardResolver {
  constructor(
    private readonly rewardService: RewardService,
    private readonly gameService: GameService,
    private readonly challengeService: ChallengeService,
  ) {}

  @Query(() => [Reward])
  @UseGuards(GqlJwtAuthGuard)
  async rewards(): Promise<Reward[]> {
    return this.rewardService.findAll();
  }

  @ResolveProperty()
  async game(@Parent() root: Reward): Promise<Game> {
    const { game } = root;
    return await this.gameService.findOne(game);
  }

  @ResolveProperty()
  async parentChallenge(@Parent() root: Reward): Promise<Challenge | undefined> {
    const { parentChallenge } = root;
    if (!parentChallenge) {
      return;
    }
    return await this.challengeService.findOne(parentChallenge);
  }
}
