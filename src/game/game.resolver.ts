import { Args, GqlExecutionContext, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';

import { ImportGameArgs } from './args/import-game.args';
import { GameService } from './game.service';
import { GameDto } from './dto/game.dto';
import { GameToDtoMapper } from './mappers/game-to-dto.mapper';
import { Game } from './models/game.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { SubmissionDto } from '../submission/dto/submission.dto';
import { Submission } from '../submission/models/submission.model';
import { SubmissionService } from '../submission/submission.service';
import { SubmissionToDtoMapper } from '../submission/mappers/submission-to-dto.mapper';
import { PlayerDto } from '../player/dto/player.dto';
import { PlayerService } from '../player/player.service';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { Player } from '../player/models/player.model';
import { UserDto } from '../keycloak/dto/user.dto';
import { KeycloakService } from '../keycloak/keycloak.service';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GameKeyExtractor } from '../common/decorators/game-key-extractor.decorator';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';

@Resolver(() => GameDto)
export class GameResolver {
  constructor(
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly keycloakService: KeycloakService,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly submissionService: SubmissionService,
    protected readonly submissionToDtoMapper: SubmissionToDtoMapper,
  ) {}

  @Roles(Role.AUTHOR)
  @Mutation(() => GameDto)
  async importGEdILArchive(@Args() importGameArgs: ImportGameArgs): Promise<GameDto> {
    const { file, gameInput } = importGameArgs;
    const { filename, mimetype, encoding, createReadStream } = await file;
    const game = await this.gameService.importGEdILArchive(
      {
        name: gameInput.name,
        description: gameInput.description,
        startDate: gameInput.startDate,
        endDate: gameInput.endDate,
      },
      { filename, mimetype, encoding: encoding as BufferEncoding, content: createReadStream() },
    );
    return this.gameToDtoMapper.transform(game);
  }

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @Query(() => [GameDto])
  async games(): Promise<GameDto[]> {
    const games: Game[] = await this.gameService.findAll();
    return Promise.all(games.map(async game => this.gameToDtoMapper.transform(game)));
  }

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @GameKeyExtractor(context => (context as GqlExecutionContext).getArgs()['id'])
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => GameDto)
  async game(@Args('id') id: string): Promise<GameDto> {
    const game: Game = await this.gameService.findById(id);
    if (!game) {
      throw new NotFoundException();
    }
    return this.gameToDtoMapper.transform(game);
  }

  @Roles(Role.AUTHOR)
  @Mutation(() => GameDto)
  async assignInstructor(@Args('gameId') gameId: string, @Args('userId') userId: string): Promise<GameDto> {
    const game: Game = await this.gameService.assignInstructor(gameId, userId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField()
  async instructors(@Parent() root: GameDto): Promise<UserDto[]> {
    const dtos: UserDto[] = [];
    for (const userId of root.instructors) {
      dtos.push(await this.keycloakService.getUser(userId));
    }
    return dtos;
  }

  @ResolveField()
  async players(@Parent() root: GameDto): Promise<PlayerDto[]> {
    const players: Player[] = await this.playerService.findAll({ _id: { $in: root.players } });
    return Promise.all(players.map(async player => this.playerToDtoMapper.transform(player)));
  }

  @ResolveField()
  async submissions(@Parent() root: GameDto): Promise<SubmissionDto[]> {
    const submissions: Submission[] = await this.submissionService.findAll({ _id: { $in: root.submissions } });
    return Promise.all(submissions.map(async submission => this.submissionToDtoMapper.transform(submission)));
  }
}
