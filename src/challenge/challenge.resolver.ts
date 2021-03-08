import { Inject, NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { Role } from '../common/enums/role.enum';
import { GameDto } from '../game/dto/game.dto';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { GameService } from '../game/game.service';
import { ChallengeService } from './challenge.service';
import { ChallengeDto } from './dto/challenge.dto';
import { ChallengeToDtoMapper } from './mappers/challenge-to-dto.mapper';
import { Challenge } from './models/challenge.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { ActivityDto } from '../evaluation-engine/dto/activity.dto';
import { ActivityService } from '../evaluation-engine/activity.service';
import { NotificationEnum } from '../common/enums/notifications.enum';
import { Game } from '../game/models/game.model';

@Resolver(() => ChallengeDto)
export class ChallengeResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly activityService: ActivityService,
  ) {}

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [ChallengeDto])
  async challenges(@Args('gameId') gameId: string): Promise<ChallengeDto[]> {
    const challenges: Challenge[] = await this.challengeService.findByGameId(gameId);
    return Promise.all(challenges.map(async challenge => this.challengeToDtoMapper.transform(challenge)));
  }

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => ChallengeDto)
  async challenge(@Args('gameId') gameId: string, @Args('id') id: string): Promise<ChallengeDto> {
    const challenge: Challenge = await this.challengeService.findById(id);
    if (!challenge || challenge.game !== gameId) {
      throw new NotFoundException();
    }
    return this.challengeToDtoMapper.transform(challenge);
  }

  @ResolveField('game', () => GameDto)
  async game(@Parent() root: ChallengeDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField('parentChallenge', () => ChallengeDto)
  async parentChallenge(@Parent() root: ChallengeDto): Promise<ChallengeDto | undefined> {
    const { parentChallenge: parentChallengeId } = root;
    if (!parentChallengeId) {
      return;
    }
    const parentChallenge = await this.challengeService.findById(parentChallengeId);
    return this.challengeToDtoMapper.transform(parentChallenge);
  }

  @ResolveField('refs', () => [ActivityDto])
  async refs(@Parent() root: ChallengeDto): Promise<ActivityDto[]> {
    const { game: gameId, refs } = root;
    const game: Game = await this.gameService.findById(gameId);
    const activities = [];
    for (const activityId of refs) {
      const activity = await this.activityService.getActivity(game.courseId, activityId);
      activities.push(activity);
    }
    return activities;
  }

  @Roles(Role.AUTHOR)
  @Subscription(() => ChallengeDto)
  challengeModified(): AsyncIterator<ChallengeDto> {
    return this.pubSub.asyncIterator(NotificationEnum.CHALLENGE_MODIFIED);
  }
}
