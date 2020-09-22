import { Resolver, Args, Query, ResolveProperty, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { ChallengeService } from '../challenge/challenge.service';
import { ChallengeEntity as Challenge } from '../challenge/entities/challenge.entity';
import { GameEntity as Game } from '../game/entities/game.entity';
import { GameService } from '../game/game.service';
import { LeaderboardEntity as Leaderboard } from './entities/leaderboard.entity';
import { LeaderboardService } from './leaderboard.service';
import { SortedResult } from './dto/sorted-result.dto';

@Resolver()
export class LeaderboardResolver {
  constructor(
    private leaderboardService: LeaderboardService,
    private gameService: GameService,
    private challengeService: ChallengeService,
  ) {}

  @Query(() => Leaderboard)
  @UseGuards(GqlJwtAuthGuard)
  async getSorted(@Args() leaderboardId: string): Promise<SortedResult> {
    return this.leaderboardService.sortLeaderboard(leaderboardId);
  }

  @ResolveProperty()
  async game(@Parent() root: Leaderboard): Promise<Game> {
    const { game } = root;
    return await this.gameService.findOne(game);
  }

  @ResolveProperty()
  async parentChallenge(@Parent() root: Leaderboard): Promise<Challenge | undefined> {
    const { parentChallenge } = root;
    if (!parentChallenge) {
      return;
    }
    return await this.challengeService.findOne(parentChallenge);
  }
}
