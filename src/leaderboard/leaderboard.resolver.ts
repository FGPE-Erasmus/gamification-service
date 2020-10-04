import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { LeaderboardService } from './leaderboard.service';
import { RankingDto } from './dto/ranking.dto';
import { LeaderboardDto } from './dto/leaderboard.dto';

@Resolver(() => LeaderboardDto)
export class LeaderboardResolver {

  constructor(
    private leaderboardService: LeaderboardService,
  ) {}

  @Query(() => LeaderboardDto)
  @UseGuards(GqlJwtAuthGuard)
  async getAll(): Promise<LeaderboardDto[]> {
    return this.leaderboardService.findAll();
  }

  @Query(() => [RankingDto])
  @UseGuards(GqlJwtAuthGuard)
  async getSorted(@Args() leaderboardId: string): Promise<RankingDto[]> {
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
