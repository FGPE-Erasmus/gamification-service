import { Inject, UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { NotificationEnum } from '../common/enums/notifications.enum';
import { ChallengeService } from '../challenge/challenge.service';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { GameDto } from '../game/dto/game.dto';
import { GameService } from '../game/game.service';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { RewardService } from './reward.service';
import { RewardDto } from './dto/reward.dto';
import { RewardToDtoMapper } from './mappers/reward-to-dto.mapper';
import { ChallengeToDtoMapper } from '../challenge/mappers/challenge-to-dto.mapper';
import { Reward } from './models/reward.model';
import { PlayerDto } from '../player/dto/player.dto';
import { Player } from '../player/models/player.model';
import { PlayerService } from '../player/player.service';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { GqlRequestedPlayerGuard } from 'src/common/guards/gql-requested-player.guard';
import { PlayerRewardDto } from 'src/player-reward/dto/player-reward.dto';

@Resolver(() => RewardDto, { isAbstract: true })
export class RewardResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly rewardService: RewardService,
    protected readonly rewardToDtoMapper: RewardToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
  ) {}

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [RewardDto])
  async rewards(@Args('gameId') gameId: string): Promise<RewardDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }

  @ResolveField('game', () => GameDto)
  async game(@Parent() root: RewardDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField('parentChallenge', () => ChallengeDto)
  async parentChallenge(@Parent() root: RewardDto): Promise<ChallengeDto> {
    const { parentChallenge: parentChallengeId } = root;
    if (!parentChallengeId) {
      return;
    }
    const parentChallenge = await this.challengeService.findById(parentChallengeId);
    return this.challengeToDtoMapper.transform(parentChallenge);
  }

  @ResolveField('players', () => [PlayerDto])
  async players(@Parent() root: RewardDto): Promise<PlayerDto[]> {
    const { players: playerIds } = root;
    if (!playerIds || playerIds.length === 0) {
      return [];
    }
    const players: Player[] = await this.playerService.findAll({
      _id: { $in: playerIds },
    });
    return Promise.all(players.map(async player => this.playerToDtoMapper.transform(player)));
  }

  @Roles(Role.STUDENT)
  @Subscription(() => PlayerRewardDto, {
    filter: (payload, variables) => payload.rewardReceived.player === variables.playerId,
  })
  rewardReceived(@Args('playerId') playerId: string): AsyncIterator<Reward> {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_RECEIVED);
  }

  @Roles(Role.STUDENT)
  @Subscription(() => PlayerRewardDto, {
    filter: async (payload, variables) => payload.rewardRemoved.player === variables.playerId,
  })
  rewardRemoved(@Args('playerId') playerId: string): AsyncIterator<Reward> {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_REMOVED);
  }

  @Roles(Role.STUDENT)
  @Subscription(() => PlayerRewardDto, {
    filter: (payload, variables) => payload.rewardSubtracted.player === variables.playerId,
  })
  rewardSubtracted(@Args('playerId') playerId: string): AsyncIterator<Reward> {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_SUBSTRACTED);
  }
}
