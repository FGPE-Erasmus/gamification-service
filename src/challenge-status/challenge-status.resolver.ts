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

@Resolver(() => ChallengeStatusDto)
export class ChallengeStatusResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly challengeStatusToDtoMapper: ChallengeStatusToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
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

  @Subscription(() => ChallengeStatusDto)
  challengeStatusUpdated(): AsyncIterator<ChallengeStatusDto> {
    //eslint-disable-next-line  @typescript-eslint/explicit-module-boundary-types
    return this.pubSub.asyncIterator(NotificationEnum.CHALLENGE_STATUS_UPDATED);
  }
}
