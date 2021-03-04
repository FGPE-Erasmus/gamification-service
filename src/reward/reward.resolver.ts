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
import { PlayerRewardDto } from '../player-reward/dto/player-reward.dto';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { PlayerReward } from '../player-reward/models/player-reward.model';
import { PlayerRewardService } from '../player-reward/player-reward.service';
import { PlayerRewardToDtoMapper } from '../player-reward/mappers/player-reward-to-dto.mapper';

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
    protected readonly playerRewardService: PlayerRewardService,
    protected readonly playerRewardToDtoMapper: PlayerRewardToDtoMapper,
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

  @ResolveField('players', () => [PlayerRewardDto])
  async players(@Parent() root: RewardDto): Promise<PlayerRewardDto[]> {
    const { id: rewardId } = root;
    const rewards: PlayerReward[] = await this.playerRewardService.findAll({ reward: { $eq: rewardId } });
    return Promise.all(rewards.map(async reward => this.playerRewardToDtoMapper.transform(reward)));
  }

  //Subscriptions for students
  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Subscription(() => PlayerRewardDto, {
    filter: (payload, variables, context) =>
      payload.rewardReceivedStudent.player === context.connection.context.player.id &&
      payload.gameId === variables.gameId,
    resolve: payload => payload.rewardReceivedStudent as PlayerRewardDto,
  })
  rewardReceivedStudent(@GqlPlayer('id') playerId: string, @Args('gameId') gameId: string): AsyncIterator<Reward> {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_RECEIVED + '_STUDENT');
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Subscription(() => PlayerRewardDto, {
    filter: async (payload, variables, context) =>
      payload.rewardRemovedStudent.player === context.connection.context.player.id &&
      payload.gameId === variables.gameId,
    resolve: payload => payload.rewardRemovedStudent as PlayerRewardDto,
  })
  rewardRemovedStudent(@GqlPlayer('id') playerId: string, @Args('gameId') gameId: string): AsyncIterator<Reward> {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_REMOVED + '_STUDENT');
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Subscription(() => PlayerRewardDto, {
    filter: (payload, variables, context) =>
      payload.rewardSubtractedStudent.player === context.connection.context.player.id &&
      payload.gameId === variables.gameId,
    resolve: payload => payload.rewardSubtractedStudent as PlayerRewardDto,
  })
  rewardSubtractedStudent(@GqlPlayer('id') playerId: string, @Args('gameId') gameId: string): AsyncIterator<Reward> {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_SUBSTRACTED + '_STUDENT');
  }

  //Subscriptions for teachers
  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Subscription(() => PlayerRewardDto, {
    filter: (payload, variables) => payload.gameId === variables.gameId,
    resolve: payload => payload.rewardReceivedTeacher as PlayerRewardDto,
  })
  rewardReceivedTeacher(@Args('gameId') gameId: string): AsyncIterator<Reward> {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_RECEIVED + '_TEACHER');
  }

  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Subscription(() => PlayerRewardDto, {
    filter: async (payload, variables) => payload.gameId === variables.gameId,
    resolve: payload => payload.rewardRemovedTeacher as PlayerRewardDto,
  })
  rewardRemovedTeacher(@Args('gameId') gameId: string): AsyncIterator<Reward> {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_REMOVED + '_TEACHER');
  }

  @Roles(Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Subscription(() => PlayerRewardDto, {
    filter: (payload, variables) => payload.gameId === variables.gameId,
    resolve: payload => payload.rewardSubtractedTeacher as PlayerRewardDto,
  })
  rewardSubtractedTeacher(@Args('gameId') gameId: string): AsyncIterator<Reward> {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_SUBSTRACTED + '_TEACHER');
  }

  @Roles(Role.AUTHOR)
  @Subscription(() => RewardDto)
  rewardModified(): AsyncIterator<RewardDto> {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_MODIFIED);
  }
}
