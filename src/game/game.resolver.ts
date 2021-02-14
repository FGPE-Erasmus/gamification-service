import {
  Args,
  GqlExecutionContext,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { Inject, NotFoundException, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

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
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GameKeyExtractor } from '../common/decorators/game-key-extractor.decorator';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { GqlUserInfo } from '../common/decorators/gql-user-info.decorator';
import { ValidationService } from '../submission/validation.service';
import { ValidationToDtoMapper } from '../submission/mappers/validation-to-dto.mapper';
import { ValidationDto } from '../submission/dto/validation.dto';
import { Validation } from '../submission/models/validation.model';
import { UserService } from '../keycloak/user.service';
import { NotificationEnum } from '../common/enums/notifications.enum';

@Resolver(() => GameDto)
export class GameResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly userService: UserService,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly submissionService: SubmissionService,
    protected readonly submissionToDtoMapper: SubmissionToDtoMapper,
    protected readonly validationService: ValidationService,
    protected readonly validationToDtoMapper: ValidationToDtoMapper,
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
        evaluationEngine: gameInput.evaluationEngine,
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
    console.log(userId);
    const game: Game = await this.gameService.assignInstructor(gameId, userId);
    return this.gameToDtoMapper.transform(game);
  }

  @Roles(Role.TEACHER)
  @Query(() => [GameDto])
  async myGames(@GqlUserInfo('sub') userId: string): Promise<GameDto[]> {
    const games: Game[] = await this.gameService.findAll({ instructors: userId });
    return Promise.all(games.map(async game => this.gameToDtoMapper.transform(game)));
  }

  @ResolveField()
  async instructors(@Parent() root: GameDto): Promise<UserDto[]> {
    const dtos: UserDto[] = [];
    for (const userId of root.instructors) {
      dtos.push(await this.userService.getUser(userId));
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

  @ResolveField()
  async validations(@Parent() root: PlayerDto): Promise<ValidationDto[]> {
    const validations: Validation[] = await this.validationService.findAll({ _id: { $in: root.validations } });
    return Promise.all(validations.map(async validation => this.validationToDtoMapper.transform(validation)));
  }

  @Roles(Role.AUTHOR)
  @Subscription(() => GameDto)
  gameModified(): AsyncIterator<GameDto> {
    return this.pubSub.asyncIterator(NotificationEnum.GAME_MODIFIED);
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @UseGuards(GqlPlayerOfGuard, GqlInstructorAssignedGuard)
  @Subscription(() => GameDto, {
    filter: (payload, variables) => payload.gameStarted.id === variables.gameId,
  })
  gameStarted(@Args('gameId') gameId: string): AsyncIterator<GameDto> {
    return this.pubSub.asyncIterator(NotificationEnum.GAME_STARTED);
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @UseGuards(GqlPlayerOfGuard, GqlInstructorAssignedGuard)
  @Subscription(() => GameDto, {
    filter: (payload, variables) => payload.gameFinished.id === variables.gameId,
  })
  gameFinished(@Args('gameId') gameId: string): AsyncIterator<GameDto> {
    return this.pubSub.asyncIterator(NotificationEnum.GAME_FINISHED);
  }
}
