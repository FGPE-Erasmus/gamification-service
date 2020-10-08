import { UseGuards, NotFoundException } from '@nestjs/common';
import { Resolver, Args, Mutation, Query, ResolveField, Parent } from '@nestjs/graphql';

import { GqlUser } from '../common/decorators/gql-user.decorator';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { Role } from '../users/models/role.enum';
import { SubmissionService } from './submission.service';
import { SendSubmissionInput } from './inputs/send-submission.input';
import { SubmissionDto } from './dto/submission.dto';
import { GameDto } from '../game/dto/game.dto';
import { RewardDto } from '../reward/dto/reward.dto';
import { SubmissionToDtoMapper } from './mappers/submission-to-dto.mapper';
import { GameService } from '../game/game.service';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { PlayerService } from '../player/player.service';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { PlayerDto } from '../player/dto/player.dto';
import { Game } from '../game/models/game.model';
import { Player } from '../player/models/player.model';

@Resolver(() => SubmissionDto)
export class SubmissionResolver {
  constructor(
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
    @Args('submissionId') id: string,
    @GqlUser('id') userId: string,
    @GqlUser('roles') roles: Role[],
  ): Promise<SubmissionDto> {
    const submission = await this.submissionService.findById(id);
    /*if (userId !== submission.player.user.id && !roles.includes(Role.ADMIN)) {
      throw new Error('User does not have permissions');
    } else {
      if (!submission) {
        throw new NotFoundException(id);
      }
    }*/
    return submission;
  }

  @Query(() => [SubmissionDto])
  @UseGuards(GqlJwtAuthGuard)
  async submissions(
    @GqlUser('id') userId: string,
    @Args('gameId') gameId: string,
    @Args('exerciseId') exerciseId?: string,
  ): Promise<SubmissionDto[]> {
    return await this.submissionService.findByUser(gameId, userId, exerciseId);
  }

  @Mutation(() => SubmissionDto)
  @UseGuards(GqlJwtAuthGuard)
  async createSubmission(@Args('submissionData') input: SendSubmissionInput): Promise<SubmissionDto> {
    return await this.submissionService.create(input);
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
}
