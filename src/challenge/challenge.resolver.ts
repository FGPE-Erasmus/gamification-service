import { UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveProperty, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GameService } from '../game/game.service';
import { GameEntity as Game } from '../game/entities/game.entity';
import { ChallengeService } from './challenge.service';
import { ChallengeEntity as Challenge } from './entities/challenge.entity';

@Resolver(() => Challenge)
export class ChallengeResolver {
  constructor(private readonly challengeService: ChallengeService, private readonly gameService: GameService) {}

  @Query(() => [Challenge])
  @UseGuards(GqlJwtAuthGuard)
  async challenges(): Promise<Challenge[]> {
    return this.challengeService.findAll();
  }

  @ResolveProperty()
  async game(@Parent() root: Challenge): Promise<Game> {
    const { game } = root;
    return await this.gameService.findOne(game);
  }

  @ResolveProperty()
  async parentChallenge(@Parent() root: Challenge): Promise<Challenge | undefined> {
    const { parentChallenge } = root;
    if (!parentChallenge) {
      return;
    }
    return await this.challengeService.findOne(parentChallenge);
  }
}
