import { Resolver, Args, Query, ResolveField, Parent, Mutation, Subscription } from '@nestjs/graphql';
import { NotFoundException, UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

import { ChallengeStatusService } from '../challenge-status/challenge-status.service';
import { ChallengeStatusDto } from '../challenge-status/dto/challenge-status.dto';
import { ChallengeStatusToDtoMapper } from '../challenge-status/mappers/challenge-status-to-dto.mapper';
import { ChallengeStatus } from '../challenge-status/models/challenge-status.model';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { GqlUserInfo } from '../common/decorators/gql-user-info.decorator';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { NotificationEnum } from '../common/enums/notifications.enum';
import { Role } from '../common/enums/role.enum';
import { GameDto } from '../game/dto/game.dto';
import { GameService } from '../game/game.service';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { Game } from '../game/models/game.model';
import { PlayerRewardDto } from '../player-reward/dto/player-reward.dto';
import { PlayerReward } from '../player-reward/models/player-reward.model';
import { PlayerRewardToDtoMapper } from '../player-reward/mappers/player-reward-to-dto.mapper';
import { PlayerRewardService } from '../player-reward/player-reward.service';
import { SubmissionDto } from '../submission/dto/submission.dto';
import { SubmissionService } from '../submission/submission.service';
import { Submission } from '../submission/models/submission.model';
import { SubmissionToDtoMapper } from '../submission/mappers/submission-to-dto.mapper';
import { PlayerDto } from './dto/player.dto';
import { PlayerService } from './player.service';
import { PlayerToDtoMapper } from './mappers/player-to-dto.mapper';
import { Player } from './models/player.model';
import { Group } from '../group/models/group.model';
import { GroupService } from '../group/group.service';
import { GroupToDtoMapper } from '../group/mappers/group-to-dto.mapper';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { GroupDto } from '../group/dto/group.dto';
import { UserDto } from '../keycloak/dto/user.dto';
import { KeycloakService } from '../keycloak/keycloak.service';

@Resolver(() => PlayerDto)
export class PlayerResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly keycloakService: KeycloakService,
    protected readonly groupService: GroupService,
    protected readonly groupToDtoMapper: GroupToDtoMapper,
    protected readonly submissionService: SubmissionService,
    protected readonly submissionToDtoMapper: SubmissionToDtoMapper,
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly challengeStatusToDtoMapper: ChallengeStatusToDtoMapper,
    protected readonly playerRewardService: PlayerRewardService,
    protected readonly playerRewardToDtoMapper: PlayerRewardToDtoMapper,
  ) {}

  @Roles(Role.STUDENT)
  @Mutation(() => PlayerDto)
  async enroll(@GqlUserInfo('sub') userId: string, @Args('gameId') gameId: string): Promise<PlayerDto> {
    const player: Player = await this.playerService.enroll(gameId, userId);
    await this.pubSub.publish(NotificationEnum.PLAYER_ENROLLED, {
      playerEnrolled: this.playerToDtoMapper.transform(player),
    });
    return this.playerToDtoMapper.transform(player);
  }

  @Roles(Role.AUTHOR, Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Mutation(() => PlayerDto)
  async addToGame(@Args('userId') userId: string, @Args('gameId') gameId: string): Promise<PlayerDto> {
    const player: Player = await this.playerService.enroll(gameId, userId);
    await this.pubSub.publish(NotificationEnum.PLAYER_ENROLLED, { player: this.playerToDtoMapper.transform(player) });
    return this.playerToDtoMapper.transform(player);
  }

  @Roles(Role.AUTHOR, Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Mutation(() => PlayerDto)
  async removeFromGame(@Args('userId') userId: string, @Args('gameId') gameId: string): Promise<PlayerDto> {
    const player: Player = await this.playerService.removeFromGame(gameId, userId);
    await this.pubSub.publish(NotificationEnum.PLAYER_LEFT, { player: this.playerToDtoMapper.transform(player) });
    return this.playerToDtoMapper.transform(player);
  }

  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [PlayerDto])
  async players(@Args('gameId') gameId: string): Promise<PlayerDto[]> {
    const players: Player[] = await this.playerService.findByGame(gameId);
    return Promise.all(players.map(async player => this.playerToDtoMapper.transform(player)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => PlayerDto)
  async profileInGame(
    @GqlUserInfo('sub') userId: string,
    @GqlPlayer() player: Player,
    @Args('gameId') gameId: string,
  ): Promise<PlayerDto> {
    if (player) {
      return this.playerToDtoMapper.transform(player);
    }
    const newPlayer: Player = await this.playerService.findByGameAndUser(gameId, userId);
    if (!newPlayer) {
      throw new NotFoundException();
    }
    return this.playerToDtoMapper.transform(newPlayer);
  }

  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => PlayerDto)
  async player(@Args('gameId') gameId: string, @Args('userId') userId: string): Promise<PlayerDto> {
    const player: Player = await this.playerService.findByGameAndUser(gameId, userId);
    if (!player) {
      throw new NotFoundException();
    }
    return this.playerToDtoMapper.transform(player);
  }

  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Mutation(() => PlayerDto)
  async setGroup(
    @Args('gameId') gameId: string,
    @Args('playerId') playerId: string,
    @Args('groupId') groupId: string,
  ): Promise<PlayerDto> {
    const player: Player = await this.playerService.setGroup(gameId, playerId, groupId);
    await this.pubSub.publish('message', { message: `Player ${player.id} has been assigned to a group: ${groupId}.` });
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
    return await this.keycloakService.getUser(userId);
  }

  @ResolveField()
  async group(@Parent() root: PlayerDto): Promise<GroupDto | undefined> {
    const { group: groupId } = root;
    if (!groupId) {
      return undefined;
    }
    const group: Group = await this.groupService.findById(groupId);
    return this.groupToDtoMapper.transform(group);
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

  @Subscription(() => PlayerDto)
  playerEnrolled(): AsyncIterator<PlayerDto> {
    return this.pubSub.asyncIterator(NotificationEnum.PLAYER_ENROLLED);
  }

  @Subscription(() => PlayerDto)
  playerLeft(): AsyncIterator<PlayerDto> {
    return this.pubSub.asyncIterator(NotificationEnum.PLAYER_LEFT);
  }

  @Subscription(() => Number)
  pointsUpdated(): AsyncIterator<Number> {
    return this.pubSub.asyncIterator(NotificationEnum.POINTS_UPDATED);
  }
}
