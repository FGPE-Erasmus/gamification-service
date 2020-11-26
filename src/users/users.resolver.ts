import { NotFoundException, UseGuards, Inject } from '@nestjs/common';
import { Query, Mutation, Subscription, Args, Resolver, ID } from '@nestjs/graphql';

import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { UserInput } from './inputs/user.input';
import { UpsertUserArgs } from './args/upsert-user.args';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UserToDtoMapper } from './mappers/user-to-dto.mapper';
import { PubSub } from 'graphql-subscriptions';
import { NotificationEnum } from 'src/common/enums/notifications.enum';
import { RewardDto } from 'src/reward/dto/reward.dto';
import { SubmissionDto } from 'src/submission/dto/submission.dto';
import { ChallengeStatusDto } from 'src/challenge-status/dto/challenge-status.dto';
import { PlayerDto } from 'src/player/dto/player.dto';

@Resolver(() => UserDto)
export class UsersResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly usersService: UsersService,
    protected readonly toDtoMapper: UserToDtoMapper,
  ) {}

  @Query(() => UserDto)
  @UseGuards(GqlJwtAuthGuard)
  async user(@Args('id') id: string): Promise<UserDto> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(id);
    }
    return this.toDtoMapper.transform(user);
  }

  @Query(() => [UserDto])
  @UseGuards(GqlJwtAuthGuard)
  async users(/*@Args() queryArgs: FindUsersDto*/): Promise<UserDto[]> {
    const users = await this.usersService.findAll(/*queryArgs*/);
    return Promise.all(users.map(async user => this.toDtoMapper.transform(user)));
  }

  @Mutation(() => UserDto)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async saveUser(@Args() mutationArgs: UpsertUserArgs): Promise<UserDto> {
    const { id, userInput }: { id?: string; userInput: UserInput } = mutationArgs;
    return this.usersService.upsert(id, userInput);
  }

  @Mutation(() => UserDto)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  deleteUser(@Args({ name: 'id', type: () => ID }) id: string): Promise<UserDto> {
    return this.usersService.delete(id);
  }

  @Subscription(returns => RewardDto)
  rewardReceived() {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_RECEIVED);
  }

  @Subscription(returns => RewardDto)
  rewardRemoved() {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_REMOVED);
  }

  @Subscription(returns => RewardDto)
  rewardSubstracted() {
    return this.pubSub.asyncIterator(NotificationEnum.REWARD_SUBSTRACTED);
  }

  @Subscription(returns => SubmissionDto)
  submissionUpdated() {
    return this.pubSub.asyncIterator(NotificationEnum.SUBMISSION_UPDATED);
  }

  @Subscription(returns => SubmissionDto)
  submissionEvaluated() {
    return this.pubSub.asyncIterator(NotificationEnum.SUBMISSION_EVALUATED);
  }

  @Subscription(returns => SubmissionDto)
  submissionSent() {
    return this.pubSub.asyncIterator(NotificationEnum.SUBMISSION_SENT);
  }

  @Subscription(returns => ChallengeStatusDto)
  challengeStatusUpdated() {
    return this.pubSub.asyncIterator(NotificationEnum.CHALLENGE_STATUS_UPDATED);
  }

  @Subscription(returns => PlayerDto)
  playerEnrolled() {
    return this.pubSub.asyncIterator(NotificationEnum.PLAYER_ENROLLED);
  }

  @Subscription(returns => Number)
  pointsUpdated() {
    return this.pubSub.asyncIterator(NotificationEnum.POINTS_UPDATED);
  }
}
