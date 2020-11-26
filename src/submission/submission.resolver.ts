import { UseGuards, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { Resolver, Args, Mutation, Query, ResolveField, Parent, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { GqlUser } from '../common/decorators/gql-user.decorator';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { Role } from '../users/models/role.enum';
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
import { GqlEnrolledInGame } from '../common/guards/gql-game-enrollment.guard';
import { NotificationEnum } from 'src/common/enums/notifications.enum';

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
  ) {}

  @Query(() => SubmissionDto)
  @UseGuards(GqlJwtAuthGuard)
  async submission(
    @GqlPlayer('id') playerId: string,
    @GqlUser('roles') roles: Role[],
    @Args('submissionId') submissionId: string,
  ): Promise<SubmissionDto> {
    const submission = await this.submissionService.findById(submissionId);
    if (!submission) {
      throw new NotFoundException();
    } else if (playerId !== submission.player.id && !roles.includes(Role.ADMIN)) {
      throw new ForbiddenException();
    }
    return this.submissionToDtoMapper.transform(submission);
  }

  @Query(() => [SubmissionDto])
  @UseGuards(GqlJwtAuthGuard)
  async submissions(
    @GqlUser('id') userId: string,
    @Args('gameId') gameId: string,
    @Args('exerciseId') exerciseId?: string,
  ): Promise<SubmissionDto[]> {
    const submissions: Submission[] = await this.submissionService.findByUser(gameId, userId, exerciseId);
    return Promise.all(submissions.map(async submission => this.submissionToDtoMapper.transform(submission)));
  }

  @Mutation(() => SubmissionDto, { nullable: true })
  @UseGuards(GqlJwtAuthGuard, GqlEnrolledInGame)
  async evaluate(@GqlPlayer('id') playerId: string, @Args() args: EvaluateArgs): Promise<SubmissionDto> {
    const { gameId, exerciseId, file } = args;
    const { filename, encoding, mimetype, createReadStream } = await file;
    const submission: Submission = await this.submissionService.sendSubmission(gameId, exerciseId, playerId, {
      filename,
      encoding: encoding as BufferEncoding,
      mimetype,
      content: await createReadStream(),
    });
    const submissionDto = this.submissionToDtoMapper.transform(submission);
    this.pubSub.publish(NotificationEnum.SUBMISSION_SENT, {
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

  @Subscription(returns => SubmissionDto)
  submissionEvaluated() {
    return this.pubSub.asyncIterator(NotificationEnum.SUBMISSION_EVALUATED);
  }

  @Subscription(returns => SubmissionDto)
  submissionSent() {
    return this.pubSub.asyncIterator(NotificationEnum.SUBMISSION_SENT);
  }
}
