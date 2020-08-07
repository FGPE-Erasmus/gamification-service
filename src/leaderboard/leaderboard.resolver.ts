import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LeaderboardEntity as Leaderboard } from './entities/leaderboard.entity';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { LeaderboardService } from './leaderboard.service';
import { SortedResult } from './dto/sorted-result.dto';

@Resolver()
export class LeaderboardResolver {
  constructor(private leaderboardService: LeaderboardService) {}

  @Query(() => Leaderboard)
  @UseGuards(GqlJwtAuthGuard)
  async getSorted(@Args('LeaderboardId') leaderboardId: string): Promise<SortedResult> {
    return this.leaderboardService.sortLeaderboard(leaderboardId);
  }
}
