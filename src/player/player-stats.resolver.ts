import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PlayerDto } from './dto/player.dto';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { PlayerService } from './player.service';
import { GameService } from '../game/game.service';
import { ValidationToDtoMapper } from '../submission/mappers/validation-to-dto.mapper';
import { SubmissionToDtoMapper } from '../submission/mappers/submission-to-dto.mapper';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { PlayerToDtoMapper } from './mappers/player-to-dto.mapper';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlUserInfo } from '../common/decorators/gql-user-info.decorator';
import { Player } from './models/player.model';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { PlayerStatsDto } from './dto/player-stats.dto';

@Resolver(() => PlayerStatsDto)
export class PlayerStatsResolver {
  constructor(
    protected readonly playerService: PlayerService,
    protected readonly gameService: GameService,
    protected readonly validationToDtoMapper: ValidationToDtoMapper,
    protected readonly submissionToDtoMapper: SubmissionToDtoMapper,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
  ) {}

  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => PlayerStatsDto)
  async playerStats(
    @Args('gameId') gameId: string,
    @GqlUserInfo('sub') currentUserId: string,
    @GqlUserInfo('ROLE') currentUserRole: string,
    @Args('userId') userId?: string,
  ): Promise<PlayerStatsDto> {
    if (currentUserRole == Role.STUDENT) {
      if (userId && userId !== currentUserId) {
        throw new ForbiddenException();
      }
    }
    return await this.playerService.playerStatistics(gameId, userId);
  }

  @ResolveField()
  async player(@Parent() root: PlayerStatsDto): Promise<PlayerDto> {
    const { player: playerId } = root;
    const player: Player = await this.playerService.findById(playerId);
    return this.playerToDtoMapper.transform(player);
  }
}
