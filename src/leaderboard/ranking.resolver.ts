import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { Player } from '../player/models/player.model';
import { PlayerDto } from '../player/dto/player.dto';
import { PlayerService } from '../player/player.service';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { LeaderboardService } from './leaderboard.service';
import { PlayerRankingDto } from './dto/player-ranking.dto';
import { LeaderboardToDtoMapper } from './mappers/leaderboard-to-dto.mapper';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';

@Resolver(() => PlayerRankingDto)
export class RankingResolver {
  constructor(
    protected readonly leaderboardService: LeaderboardService,
    protected readonly leaderboardToDtoMapper: LeaderboardToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
  ) {}

  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Query(() => [PlayerRankingDto])
  async rankings(
    @Args('gameId') gameId: string,
    @Args('leaderboardId') leaderboardId: string,
  ): Promise<PlayerRankingDto[]> {
    return this.leaderboardService.getRankings(leaderboardId);
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [PlayerRankingDto])
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
