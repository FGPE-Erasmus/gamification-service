import { UseGuards, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { Resolver, Args, Mutation, Query, ResolveField, Parent, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { NotificationEnum } from '../common/enums/notifications.enum';
import { GameDto } from '../game/dto/game.dto';
import { SubmissionToDtoMapper } from './mappers/submission-to-dto.mapper';
import { GameService } from '../game/game.service';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { PlayerService } from '../player/player.service';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { PlayerDto } from '../player/dto/player.dto';
import { Game } from '../game/models/game.model';
import { Player } from '../player/models/player.model';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { EvaluateArgs } from './args/evaluate.args';
import { SubmissionDto } from './dto/submission.dto';
import { SubmissionService } from './submission.service';
import { Submission } from './models/submission.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlUserInfo } from '../common/decorators/gql-user-info.decorator';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { EvaluationEngineService } from '../evaluation-engine/evaluation-engine.service';

@Resolver(() => SubmissionDto)
export class SubmissionResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly submissionService: SubmissionService,
    protected readonly submissionToDtoMapper: SubmissionToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly evaluationEngineService: EvaluationEngineService,
  ) {}

  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => SubmissionDto)
  async submission(
    @GqlPlayer('id') playerId: string,
    @Args('gameId') gameId: string,
    @Args('id') id: string,
  ): Promise<SubmissionDto> {
    const submission = await this.submissionService.findById(id);
    if (!submission || submission.game !== gameId) {
      throw new NotFoundException();
    } else if (playerId && playerId !== submission.player) {
      throw new ForbiddenException();
    }
    return this.submissionToDtoMapper.transform(submission);
  }

  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Query(() => [SubmissionDto])
  async submissions(
    @Args('userId') userId: string,
    @Args('gameId') gameId: string,
    @Args('exerciseId', { nullable: true }) exerciseId?: string,
  ): Promise<SubmissionDto[]> {
    const submissions: Submission[] = await this.submissionService.findByUser(gameId, userId, exerciseId);
    return Promise.all(submissions.map(async submission => this.submissionToDtoMapper.transform(submission)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [SubmissionDto])
  async mySubmissions(
    @GqlUserInfo('sub') userId: string,
    @Args('gameId') gameId: string,
    @Args('exerciseId', { nullable: true }) exerciseId?: string,
  ): Promise<SubmissionDto[]> {
    const submissions: Submission[] = await this.submissionService.findByUser(gameId, userId, exerciseId);
    return Promise.all(submissions.map(async submission => this.submissionToDtoMapper.transform(submission)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Mutation(() => SubmissionDto, { nullable: true })
  async evaluate(@GqlPlayer('id') playerId: string, @Args() args: EvaluateArgs): Promise<SubmissionDto> {
    const { gameId, exerciseId, file } = args;
    const { filename, encoding, mimetype, createReadStream } = await file;
    const submission: Submission = await this.submissionService.evaluate(gameId, exerciseId, playerId, {
      filename,
      encoding: encoding as BufferEncoding,
      mimetype,
      content: await createReadStream(),
    });
    const submissionDto = this.submissionToDtoMapper.transform(submission);
    await this.pubSub.publish(NotificationEnum.SUBMISSION_SENT, {
      submissionSent: this.submissionToDtoMapper.transform(submission),
    });
    return submissionDto;
  }

  @ResolveField('game', () => GameDto)
  async game(@Parent() root: SubmissionDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game: Game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField('player', () => PlayerDto)
  async player(@Parent() root: SubmissionDto): Promise<PlayerDto> {
    const { player: playerId } = root;
    const player: Player = await this.playerService.findById(playerId);
    return this.playerToDtoMapper.transform(player);
  }

  @ResolveField('program', () => String)
  async program(@Parent() root: SubmissionDto): Promise<string> {
    const { id: submissionId } = root;
    return this.evaluationEngineService.getSubmissionProgram(submissionId);
  }

  @Subscription(() => SubmissionDto)
  submissionEvaluated(): AsyncIterator<SubmissionDto> {
    return this.pubSub.asyncIterator(NotificationEnum.SUBMISSION_EVALUATED);
  }

  @Subscription(() => SubmissionDto)
  submissionSent(): AsyncIterator<SubmissionDto> {
    return this.pubSub.asyncIterator(NotificationEnum.SUBMISSION_SENT);
  }
}
