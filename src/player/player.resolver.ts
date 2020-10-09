import { Resolver, Args, Query, ResolveField, Parent, Mutation } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';

import { GqlUser } from '../common/decorators/gql-user.decorator';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GameDto } from '../game/dto/game.dto';
import { GameService } from '../game/game.service';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { Game } from '../game/models/game.model';
import { SubmissionDto } from '../submission/dto/submission.dto';
import { SubmissionService } from '../submission/submission.service';
import { SubmissionToDtoMapper } from '../submission/mappers/submission-to-dto.mapper';
import { UserDto } from '../users/dto/user.dto';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { UserToDtoMapper } from '../users/mappers/user-to-dto.mapper';
import { PlayerDto } from './dto/player.dto';
import { PlayerService } from './player.service';
import { PlayerToDtoMapper } from './mappers/player-to-dto.mapper';
import { Player } from './models/player.model';
import { ChallengeStatusService } from '../challenge-status/challenge-status.service';
import { ChallengeStatusToDtoMapper } from '../challenge-status/mappers/challenge-status-to-dto.mapper';
import { PlayerRewardService } from '../player-reward/player-reward.service';
import { PlayerRewardToDtoMapper } from '../player-reward/mappers/player-reward-to-dto.mapper';
import { Submission } from '../submission/models/submission.model';
import { ChallengeStatusDto } from '../challenge-status/dto/challenge-status.dto';
import { ChallengeStatus } from '../challenge-status/models/challenge-status.model';
import { PlayerRewardDto } from '../player-reward/dto/player-reward.dto';
import { PlayerReward } from '../player-reward/models/player-reward.model';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { GqlEnrolledInGame } from '../common/guards/gql-game-enrollment.guard';

@Resolver(() => PlayerDto)
export class PlayerResolver {
  constructor(
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly userService: UsersService,
    protected readonly userToDtoMapper: UserToDtoMapper,
    protected readonly submissionService: SubmissionService,
    protected readonly submissionToDtoMapper: SubmissionToDtoMapper,
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly challengeStatusToDtoMapper: ChallengeStatusToDtoMapper,
    protected readonly playerRewardService: PlayerRewardService,
    protected readonly playerRewardToDtoMapper: PlayerRewardToDtoMapper,
  ) {}

  @Mutation(() => PlayerDto)
  @UseGuards(GqlJwtAuthGuard)
  async enroll(
    @GqlUser('id') userId: string,
    @GqlPlayer() playerDto: PlayerDto,
    @Args('gameId') gameId: string,
  ): Promise<PlayerDto> {
    if (playerDto) {
      return playerDto;
    }
    const player: Player = await this.playerService.enroll(gameId, userId);
    return this.playerToDtoMapper.transform(player);
  }

  @Query(() => [PlayerDto])
  @UseGuards(GqlJwtAuthGuard)
  async players(@Args('gameId') gameId: string): Promise<PlayerDto[]> {
    const players: Player[] = await this.playerService.findByGame(gameId);
    return Promise.all(players.map(async player => this.playerToDtoMapper.transform(player)));
  }

  @Query(() => PlayerDto)
  @UseGuards(GqlJwtAuthGuard, GqlEnrolledInGame)
  async profileInGame(
    @GqlUser('id') userId: string,
    @GqlPlayer() playerDto: PlayerDto,
    @Args('gameId') gameId: string,
  ): Promise<PlayerDto> {
    if (playerDto) {
      return playerDto;
    }
    const player: Player = await this.playerService.findByGameAndUser(gameId, userId);
    if (!player) {
      throw new NotFoundException();
    }
    return this.playerToDtoMapper.transform(player);
  }

  @Query(() => PlayerDto)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async player(@Args('gameId') gameId: string, @Args('userId') userId: string): Promise<PlayerDto> {
    const player: Player = await this.playerService.findByGameAndUser(gameId, userId);
    if (!player) {
      throw new NotFoundException();
    }
    return this.playerToDtoMapper.transform(player);
  }

  @ResolveField()
  async game(@Parent() root: PlayerDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game: Game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField()
  async user(@Parent() root: PlayerDto): Promise<UserDto> {
    const { user: userId } = root;
    const user: User = await this.userService.findById(userId);
    return this.userToDtoMapper.transform(user);
  }

  @ResolveField()
  async submissions(@Parent() root: PlayerDto): Promise<SubmissionDto[]> {
    const { id: playerId } = root;
    const submissions: Submission[] = await this.submissionService.findAll({ player: { $eq: playerId } });
    return Promise.all(submissions.map(async submission => this.submissionToDtoMapper.transform(submission)));
  }

  @ResolveField()
  async learningPath(@Parent() root: PlayerDto): Promise<ChallengeStatusDto[]> {
    const { id: playerId } = root;
    const challengeStatuses: ChallengeStatus[] = await this.challengeStatusService.findAll({
      player: { $eq: playerId },
    });
    return Promise.all(challengeStatuses.map(async status => this.challengeStatusToDtoMapper.transform(status)));
  }

  @ResolveField()
  async rewards(@Parent() root: PlayerDto): Promise<PlayerRewardDto[]> {
    const { id: playerId } = root;
    const rewards: PlayerReward[] = await this.playerRewardService.findAll({ player: { $eq: playerId } });
    return Promise.all(rewards.map(async reward => this.playerRewardToDtoMapper.transform(reward)));
  }
}
