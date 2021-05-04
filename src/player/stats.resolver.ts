import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PlayerDto } from './dto/player.dto';
import { UseGuards } from '@nestjs/common';
import { PlayerService } from './player.service';
import { GameService } from '../game/game.service';
import { ValidationToDtoMapper } from '../submission/mappers/validation-to-dto.mapper';
import { SubmissionToDtoMapper } from '../submission/mappers/submission-to-dto.mapper';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { PlayerToDtoMapper } from './mappers/player-to-dto.mapper';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { StatsDto } from './dto/stats.dto';
import { GameDto } from '../game/dto/game.dto';
import { Game } from '../game/models/game.model';

@Resolver(() => StatsDto)
export class StatsResolver {
  constructor(
    protected readonly playerService: PlayerService,
    protected readonly gameService: GameService,
    protected readonly validationToDtoMapper: ValidationToDtoMapper,
    protected readonly submissionToDtoMapper: SubmissionToDtoMapper,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
  ) {}

  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Query(() => StatsDto)
  async stats(
    @Args('gameId') gameId: string,
    @Args('groupId', { nullable: true }) groupId?: string,
  ): Promise<StatsDto> {
    return this.playerService.statistics(gameId, groupId);
  }

  @ResolveField()
  async game(@Parent() root: PlayerDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game: Game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }
}
