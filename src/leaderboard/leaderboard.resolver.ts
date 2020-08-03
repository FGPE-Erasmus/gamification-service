import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LeaderboardEntity as Leaderboard } from './entities/leaderboard.entity';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardDto } from './leaderboard.dto';
import { SortedResult } from './entities/sorted-result.dto';

@Resolver()
export class LeaderboardResolver {
  constructor(private leaderboardService: LeaderboardService) {}

  @Query(() => Leaderboard)
  @UseGuards(GqlJwtAuthGuard)
  async get(@Args() leaderboard: LeaderboardDto): Promise<SortedResult> {
    return this.leaderboardService.sortLeaderboard(
      leaderboard.id,
      leaderboard.name,
      leaderboard.metrics,
      leaderboard.sortingOrders,
    );
  }
}
