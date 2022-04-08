import { ForbiddenException, Inject, NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { NotificationEnum } from '../common/enums/notifications.enum';
import { GameDto } from '../game/dto/game.dto';
import { GameService } from '../game/game.service';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { PlayerService } from '../player/player.service';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { PlayerDto } from '../player/dto/player.dto';
import { Game } from '../game/models/game.model';
import { Player } from '../player/models/player.model';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { ValidationDto } from './dto/validation.dto';
import { ValidationService } from './validation.service';
import { Validation } from './models/validation.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlUserInfo } from '../common/decorators/gql-user-info.decorator';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { EvaluationEngineService } from '../evaluation-engine/evaluation-engine.service';
import { ValidateArgs } from './args/validate.args';
import { ValidationToDtoMapper } from './mappers/validation-to-dto.mapper';

@Resolver(() => ValidationDto)
export class ValidationResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly validationService: ValidationService,
    protected readonly validationToDtoMapper: ValidationToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly evaluationEngineService: EvaluationEngineService,
  ) {}

  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => ValidationDto)
  async validation(
    @GqlPlayer('id') playerId: string,
    @Args('gameId') gameId: string,
    @Args('id') id: string,
  ): Promise<ValidationDto> {
    const validation = await this.validationService.findById(id);
    if (!validation || validation.game !== gameId) {
      throw new NotFoundException();
    } else if (playerId && playerId !== validation.player) {
      throw new ForbiddenException();
    }
    return this.validationToDtoMapper.transform(validation);
  }

  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Query(() => [ValidationDto])
  async validations(
    @Args('userId') userId: string,
    @Args('gameId') gameId: string,
    @Args('exerciseId', { nullable: true }) exerciseId?: string,
  ): Promise<ValidationDto[]> {
    const validations: Validation[] = await this.validationService.findByUser(gameId, userId, exerciseId);
    return Promise.all(validations.map(async validation => this.validationToDtoMapper.transform(validation)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => ValidationDto)
  async latestValidation(
    @GqlPlayer('id') playerId: string,
    @Args('gameId') gameId: string,
    @Args('exerciseId') exerciseId: string,
  ): Promise<ValidationDto> {
    const validations: Validation[] = await this.validationService.findAll(
      {
        game: gameId,
        player: playerId,
        exerciseId: exerciseId,
      },
      {},
      { sort: { createdAt: -1 }, limit: 1 },
    );
    if ( validations.length === 0 ) throw new NotFoundException();
    return await this.validationToDtoMapper.transform(validations[0]);
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [ValidationDto])
  async myValidations(
    @GqlUserInfo('sub') userId: string,
    @Args('gameId') gameId: string,
    @Args('exerciseId', { nullable: true }) exerciseId?: string,
  ): Promise<ValidationDto[]> {
    const validations: Validation[] = await this.validationService.findByUser(gameId, userId, exerciseId);
    return Promise.all(validations.map(async validation => this.validationToDtoMapper.transform(validation)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Mutation(() => ValidationDto, { nullable: true })
  async validate(@GqlPlayer('id') playerId: string, @Args() args: ValidateArgs): Promise<ValidationDto> {
    const { gameId, exerciseId, file } = args;
    const { filename, encoding, mimetype, createReadStream } = await file;
    const validation: Validation = await this.validationService.validate(
      gameId,
      exerciseId,
      playerId,
      {
        filename,
        encoding: encoding as BufferEncoding,
        mimetype,
        content: await createReadStream(),
      },
      args.inputs,
    );
    return this.validationToDtoMapper.transform(validation);
  }

  @ResolveField('game', () => GameDto)
  async game(@Parent() root: ValidationDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game: Game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField('player', () => PlayerDto)
  async player(@Parent() root: ValidationDto): Promise<PlayerDto> {
    const { player: playerId } = root;
    const player: Player = await this.playerService.findById(playerId);
    return this.playerToDtoMapper.transform(player);
  }

  //Subscription for students
  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Subscription(() => ValidationDto, {
    filter: (payload, variables, context) =>
      payload.validationProcessedStudent.game === variables.gameId &&
      payload.validationProcessedStudent.player === context.connection.context.player.id,
  })
  validationProcessedStudent(
    @GqlPlayer('id') playerId: string,
    @Args('gameId') gameId: string,
  ): AsyncIterator<ValidationDto> {
    return this.pubSub.asyncIterator(NotificationEnum.VALIDATION_PROCESSED + '_STUDENT');
  }

  //Subscription for teachers
  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Subscription(() => ValidationDto, {
    filter: (payload, variables) => payload.validationProcessedTeacher.game === variables.gameId,
  })
  validationProcessedTeacher(@Args('gameId') gameId: string): AsyncIterator<ValidationDto> {
    return this.pubSub.asyncIterator(NotificationEnum.VALIDATION_PROCESSED + '_TEACHER');
  }
}
