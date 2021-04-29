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
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { Challenge } from '../challenge/models/challenge.model';
import { ChallengeService } from '../challenge/challenge.service';
import { ChallengeToDtoMapper } from '../challenge/mappers/challenge-to-dto.mapper';
import { GroupDto } from '../group/dto/group.dto';
import { Group } from '../group/models/group.model';
import { GroupService } from '../group/group.service';
import { GroupToDtoMapper } from '../group/mappers/group-to-dto.mapper';

@Resolver(() => GameDto)
export class GameResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly userService: UserService,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
    protected readonly groupService: GroupService,
    protected readonly groupToDtoMapper: GroupToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly submissionService: SubmissionService,
    protected readonly submissionToDtoMapper: SubmissionToDtoMapper,
    protected readonly validationService: ValidationService,
    protected readonly validationToDtoMapper: ValidationToDtoMapper,
  ) {}

  @Roles(Role.TEACHER)
  @Mutation(() => GameDto)
  async importGEdILArchive(
    @Args() importGameArgs: ImportGameArgs,
    @GqlUserInfo('sub') teacherId: string,
  ): Promise<GameDto> {
    const { file, gameInput } = importGameArgs;
    const { filename, mimetype, encoding, createReadStream } = await file;
    const game = await this.gameService.importGEdILArchive(
      {
        name: gameInput.name,
        private: gameInput.private,
        description: gameInput.description,
        startDate: gameInput.startDate,
        endDate: gameInput.endDate,
        evaluationEngine: gameInput.evaluationEngine,
        courseId: gameInput.courseId,
      },
      { filename, mimetype, encoding: encoding as BufferEncoding, content: createReadStream() },
      teacherId,
    );
    return this.gameToDtoMapper.transform(game);
  }

  @Roles(Role.TEACHER, Role.STUDENT)
  @Query(() => [GameDto])
  async games(@GqlUserInfo('sub') userId: string, @GqlUserInfo('ROLE') userRole: string): Promise<GameDto[]> {
    const query: { $or: any[] } = {
      $or: [{ private: false }],
    };

    if (userRole === Role.STUDENT) {
      const playerIds = await this.playerService.findByUser(userId);
      playerIds.forEach(id => {
        query.$or.push({ $and: [{ players: id }, { private: true }] });
      });
    } else if (userRole === Role.TEACHER) {
      query.$or.push({ $and: [{ instructors: userId }, { private: true }] });
    }
    const games = await this.gameService.findAll(query);
    return Promise.all(games.map(async game => this.gameToDtoMapper.transform(game)));
  }

  @Roles(Role.TEACHER, Role.STUDENT)
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

  @Roles(Role.TEACHER)
  @GameKeyExtractor(context => (context as GqlExecutionContext).getArgs()['id'])
  @UseGuards(GqlInstructorAssignedGuard)
  @Query(() => GameDto)
  async generateEnrollToken(@Args('id') id: string): Promise<GameDto> {
    const game: Game = await this.gameService.findById(id);
    if (!game) {
      throw new NotFoundException();
    }
    return this.gameToDtoMapper.transform(game);
  }

  @Roles(Role.TEACHER)
  @Mutation(() => GameDto)
  async assignInstructor(@Args('gameId') gameId: string, @Args('userId') userId: string): Promise<GameDto> {
    const game: Game = await this.gameService.assignInstructor(gameId, userId);
    return this.gameToDtoMapper.transform(game);
  }

  @Roles(Role.TEACHER)
  @Query(() => [GameDto])
  async myGames(@GqlUserInfo('sub') userId: string): Promise<GameDto[]> {
    const games: Game[] = await this.gameService.findAll({ instructors: userId });
    return Promise.all(games.map(async game => this.gameToDtoMapper.transform(game)));
  }

  @Roles(Role.TEACHER)
  @Mutation(() => GameDto)
  async removeGame(@Args('gameId') gameId: string): Promise<GameDto> {
    const game: Game = await this.gameService.removeGame(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @Roles(Role.TEACHER)
  @Mutation(() => GameDto)
  async setAvailability(@Args('gameId') gameId: string, @Args('isPrivate') isPrivate: boolean): Promise<GameDto> {
    const game: Game = await this.gameService.findOneAndUpdate({ _id: gameId }, { private: isPrivate });
    return this.gameToDtoMapper.transform(game);
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
  async groups(@Parent() root: GameDto): Promise<GroupDto[]> {
    const groups: Group[] = await this.groupService.findAll({ game: root.id });
    return Promise.all(groups.map(async group => this.groupToDtoMapper.transform(group)));
  }

  @ResolveField()
  async challenges(@Parent() root: GameDto): Promise<ChallengeDto[]> {
    const challenges: Challenge[] = await this.challengeService.findAll({ game: root.id });
    return Promise.all(challenges.map(async challenge => this.challengeToDtoMapper.transform(challenge)));
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

  @Roles(Role.TEACHER)
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
