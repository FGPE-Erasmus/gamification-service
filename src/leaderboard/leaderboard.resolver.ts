import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { LeaderboardService } from './leaderboard.service';
import { PlayerRankingDto } from './dto/player-ranking.dto';
import { LeaderboardDto } from './dto/leaderboard.dto';

@Resolver()
export class LeaderboardResolver {
  constructor(private leaderboardService: LeaderboardService) {}

  @Query(() => LeaderboardDto)
  @UseGuards(GqlJwtAuthGuard)
  async getAll(): Promise<LeaderboardDto[]> {
    return this.leaderboardService.findAll();
  }

  @Query(() => [PlayerRankingDto])
  @UseGuards(GqlJwtAuthGuard)
  async getPlayerRankings(@Args('leaderboardId') leaderboardId: string): Promise<PlayerRankingDto[]> {
    return this.leaderboardService.getRankings(leaderboardId);
  }

  /*@ResolveProperty()
  async game(@Parent() root: LeaderboardDto): Promise<GameDto> {
    const { game } = root;
    return await this.gameService.findById(game);
  }

  @ResolveProperty()
  async parentChallenge(@Parent() root: LeaderboardDto): Promise<ChallengeDto | undefined> {
    const { parentChallenge } = root;
    if (!parentChallenge) {
      return;
    }
    return await this.challengeService.findOne(parentChallenge);
  }*/
}
