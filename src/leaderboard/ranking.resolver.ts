import { Resolver, Args, Query, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { PlayerDto } from '../player/dto/player.dto';
import { PlayerService } from '../player/player.service';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { LeaderboardService } from './leaderboard.service';
import { PlayerRankingDto } from './dto/player-ranking.dto';
import { LeaderboardToDtoMapper } from './mappers/leaderboard-to-dto.mapper';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { GqlEnrolledInGame } from '../common/guards/gql-game-enrollment.guard';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { Player } from '../player/models/player.model';

@Resolver(() => PlayerRankingDto)
export class RankingResolver {
  constructor(
    protected readonly leaderboardService: LeaderboardService,
    protected readonly leaderboardToDtoMapper: LeaderboardToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
  ) {}

  @Query(() => [PlayerRankingDto])
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async rankings(
    @Args('gameId') gameId: string,
    @Args('leaderboardId') leaderboardId: string,
  ): Promise<PlayerRankingDto[]> {
    return this.leaderboardService.getRankings(leaderboardId);
  }

  @Query(() => [PlayerRankingDto])
  @UseGuards(GqlJwtAuthGuard, GqlEnrolledInGame)
  async groupRankings(
    @GqlPlayer() player: Player,
    @Args('gameId') gameId: string,
    @Args('leaderboardId') leaderboardId: string,
  ): Promise<PlayerRankingDto[]> {
    return this.leaderboardService.getRankings(leaderboardId, player.group);
  }

  @ResolveField()
  async player(@Parent() root: PlayerRankingDto): Promise<PlayerDto> {
    const { player: playerId } = root;
    const player = await this.playerService.findById(playerId);
    return this.playerToDtoMapper.transform(player);
  }
}
