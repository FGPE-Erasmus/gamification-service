import { Resolver, Args, Query, ResolveField, Parent, Subscription } from '@nestjs/graphql';
import { NotFoundException, UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

import { NotificationEnum } from '../common/enums/notifications.enum';
import { ChallengeStatusService } from './challenge-status.service';
import { ChallengeStatusDto } from './dto/challenge-status.dto';
import { ChallengeStatusToDtoMapper } from './mappers/challenge-status-to-dto.mapper';
import { PlayerDto } from '../player/dto/player.dto';
import { Player } from '../player/models/player.model';
import { PlayerService } from '../player/player.service';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { ChallengeStatus } from './models/challenge-status.model';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { Challenge } from '../challenge/models/challenge.model';
import { ChallengeService } from '../challenge/challenge.service';
import { ChallengeToDtoMapper } from '../challenge/mappers/challenge-to-dto.mapper';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { ActivityStatusDto } from '../evaluation-engine/dto/activity-status.dto';
import { ActivityService } from '../evaluation-engine/activity.service';
import { GameDto } from '../game/dto/game.dto';
import { GameService } from '../game/game.service';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';

@Resolver(() => ChallengeStatusDto)
export class ChallengeStatusResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly challengeStatusToDtoMapper: ChallengeStatusToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
    protected readonly activityService: ActivityService,
  ) {}

  @Roles(Role.AUTHOR, Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Query(() => ChallengeStatusDto)
  async challengeStatus(
    @Args('playerId') playerId: string,
    @Args('challengeId') challengeId: string,
  ): Promise<ChallengeStatusDto> {
    const status: ChallengeStatus = await this.challengeStatusService.findByChallengeIdAndPlayerId(
      challengeId,
      playerId,
    );
    if (!status) {
      throw new NotFoundException();
    }
    return this.challengeStatusToDtoMapper.transform(status);
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => ChallengeStatusDto)
  async myChallengeStatus(
    @GqlPlayer('id') playerId: string,
    @Args('challengeId') challengeId: string,
  ): Promise<ChallengeStatusDto> {
    const status: ChallengeStatus = await this.challengeStatusService.findByChallengeIdAndPlayerId(
      challengeId,
      playerId,
    );
    if (!status) {
      throw new NotFoundException();
    }
    return this.challengeStatusToDtoMapper.transform(status);
  }

  @ResolveField('game', () => GameDto)
  async game(@Parent() root: ChallengeDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField('challenge', () => ChallengeDto)
  async challenge(@Parent() root: ChallengeStatusDto): Promise<ChallengeDto> {
    const { challenge: challengeId } = root;
    const challenge: Challenge = await this.challengeService.findById(challengeId);
    return this.challengeToDtoMapper.transform(challenge);
  }

  @ResolveField('player', () => PlayerDto)
  async player(@Parent() root: ChallengeStatusDto): Promise<PlayerDto> {
    const { player: playerId } = root;
    const player: Player = await this.playerService.findById(playerId);
    return this.playerToDtoMapper.transform(player);
  }

  @ResolveField('refs', () => [ActivityStatusDto])
  async refs(@Parent() root: ChallengeStatusDto): Promise<ActivityStatusDto[]> {
    const { challenge: challengeId, player } = root;
    const challenge: Challenge = await this.challengeService.findById(challengeId);
    const activities = [];
    for (const activityId of challenge.refs) {
      const activity = await this.activityService.getActivityStatus(challenge.game, activityId, player);
      activities.push(activity);
    }
    return activities;
  }

  @ResolveField('progress', () => Number)
  async progress(@Parent() root: ChallengeStatusDto): Promise<number> {
    const { challenge: challengeId, player } = root;
    const challenge: Challenge = await this.challengeService.findById(challengeId);
    return this.challengeStatusService.progress(challenge.game, challengeId, player);
  }

  @Subscription(() => ChallengeStatusDto)
  challengeStatusUpdated(): AsyncIterator<ChallengeStatusDto> {
    //eslint-disable-next-line  @typescript-eslint/explicit-module-boundary-types
    return this.pubSub.asyncIterator(NotificationEnum.CHALLENGE_STATUS_UPDATED);
  }
}
