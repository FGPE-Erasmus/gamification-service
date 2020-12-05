import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';

import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { Role } from '../common/enums/role.enum';
import { GameService } from '../game/game.service';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { GameDto } from '../game/dto/game.dto';
import { Game } from '../game/models/game.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { PlayerDto } from '../player/dto/player.dto';
import { PlayerService } from '../player/player.service';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { Player } from '../player/models/player.model';
import { UpsertGroupArgs } from './args/upsert-group.args';
import { GroupDto } from './dto/group.dto';
import { GroupInput } from './inputs/group.input';
import { GroupService } from './group.service';
import { GroupToDtoMapper } from './mappers/group-to-dto.mapper';
import { Group } from './models/group.model';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';

@Resolver(() => GroupDto)
export class GroupResolver {
  constructor(
    protected readonly service: GroupService,
    protected readonly groupToDtoMapper: GroupToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
  ) {}

  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Query(() => [GroupDto])
  async groups(@Args('gameId') gameId: string): Promise<GroupDto[]> {
    const groups: Group[] = await this.service.findByGame(gameId);
    return Promise.all(groups.map(async group => this.groupToDtoMapper.transform(group)));
  }

  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Query(() => GroupDto)
  async group(@Args('gameId') gameId: string, @Args('id') groupId: string): Promise<GroupDto> {
    const group: Group = await this.service.findById(groupId);
    if (!group || group.game !== gameId) {
      throw new NotFoundException();
    }
    return this.groupToDtoMapper.transform(group);
  }

  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Mutation(() => GroupDto)
  async saveGroup(@Args('gameId') gameId: string, @Args() mutationArgs: UpsertGroupArgs): Promise<GroupDto> {
    const { id, groupInput }: { id?: string; groupInput: GroupInput } = mutationArgs;
    let group: Group;
    if (id) {
      group = await this.service.update(id, { ...groupInput, game: gameId });
    } else {
      group = await this.service.create({ ...groupInput, game: gameId });
    }
    return this.groupToDtoMapper.transform(group);
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => GroupDto)
  async groupInGame(@Args('gameId') gameId: string, @GqlPlayer('group') groupId: string): Promise<GroupDto> {
    const group: Group = await this.service.findById(groupId);
    if (!group) {
      throw new NotFoundException();
    }
    return this.groupToDtoMapper.transform(group);
  }

  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Mutation(() => [GroupDto])
  async autoAssignGroups(@Args('gameId') gameId: string): Promise<GroupDto[]> {
    const groups: Group[] = await this.service.autoAssignPlayers(gameId);
    return Promise.all(groups.map(async group => this.groupToDtoMapper.transform(group)));
  }

  @ResolveField()
  async game(@Parent() root: PlayerDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game: Game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField()
  async players(@Parent() root: GroupDto): Promise<PlayerDto[]> {
    const { players: playerIds } = root;
    const players: Player[] = await this.playerService.findAll({
      _id: { $in: playerIds },
    });
    return Promise.all(players.map(async player => this.playerToDtoMapper.transform(player)));
  }
}
